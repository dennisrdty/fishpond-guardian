import { useEffect, useState } from "react";
import { Thermometer, Droplet, RefreshCw, Database } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SensorData {
  id: string;
  temperature: number;
  ph: number;
  created_at: string;
}

const Index = () => {
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLatestData = async () => {
    try {
      const { data, error } = await supabase
        .from('sensor_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      setLatestData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data sensor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('sensor_data_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_data'
        },
        (payload) => {
          setLatestData(payload.new as SensorData);
          toast.success('Data baru diterima!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getTemperatureStatus = (temp: number): "normal" | "warning" | "danger" => {
    if (temp >= 26 && temp <= 30) return "normal";
    if (temp >= 24 && temp <= 32) return "warning";
    return "danger";
  };

  const getPhStatus = (ph: number): "normal" | "warning" | "danger" => {
    if (ph >= 7 && ph <= 8.5) return "normal";
    if (ph >= 6.5 && ph <= 9) return "warning";
    return "danger";
  };

  const temperature = latestData?.temperature || 0;
  const ph = latestData?.ph || 0;
  const lastUpdate = latestData?.created_at 
    ? new Date(latestData.created_at).toLocaleString('id-ID')
    : '-';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: "var(--gradient-water)" }}>
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Sistem Monitoring Tambak</h1>
                <p className="text-sm text-muted-foreground">Pemantauan Kualitas Air Real-time</p>
              </div>
            </div>
            <Button 
              onClick={fetchLatestData}
              disabled={loading}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Status Banner */}
        <div 
          className="rounded-2xl p-6 mb-8 text-white relative overflow-hidden"
          style={{ background: "var(--gradient-water)" }}
        >
          <div className="relative z-10">
            <h2 className="text-xl font-semibold mb-2">Status Sistem</h2>
            <p className="text-white/90">
              Terakhir diperbarui: <span className="font-medium">{lastUpdate}</span>
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
        </div>

        {/* Metrics Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-xl" />
            ))}
          </div>
        ) : latestData ? (
          <div className="grid gap-6 md:grid-cols-2">
            <MetricCard
              title="Suhu Air"
              value={temperature.toFixed(1)}
              unit="°C"
              icon={Thermometer}
              status={getTemperatureStatus(temperature)}
              range="26-30°C"
            />
            <MetricCard
              title="Tingkat pH"
              value={ph.toFixed(1)}
              unit=""
              icon={Droplet}
              status={getPhStatus(ph)}
              range="7.0-8.5"
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Belum Ada Data</h3>
            <p className="text-muted-foreground">
              Menunggu data dari sensor IoT...
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-6 bg-card rounded-xl border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-3">Informasi Parameter</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-primary" />
                Suhu Air
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Ideal: 26-30°C</li>
                <li>• Toleransi: 24-32°C</li>
                <li>• Di luar rentang ini dapat menyebabkan stres pada ikan</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Droplet className="h-4 w-4 text-primary" />
                Tingkat pH
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Ideal: 7.0-8.5</li>
                <li>• Toleransi: 6.5-9.0</li>
                <li>• pH ekstrem dapat mempengaruhi kesehatan ikan</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;