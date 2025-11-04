import { useEffect, useState } from "react";
import { Thermometer, Droplet, RefreshCw, Database, Ruler, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface SensorData {
  id: string;
  temperature: number;
  ph: number;
  water_level?: number;
  created_at: string;
}

interface ChartData {
  time: string;
  temperature: number;
  ph: number;
}

const Index = () => {
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
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

  const fetchChartData = async () => {
    try {
      const { data, error } = await supabase
        .from('sensor_data')
        .select('temperature, ph, created_at')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      
      if (data) {
        const formattedData = data.map(item => ({
          time: new Date(item.created_at).toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          temperature: Number(item.temperature),
          ph: Number(item.ph)
        }));
        setChartData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  useEffect(() => {
    fetchLatestData();
    fetchChartData();

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
          fetchChartData();
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
          <div className="flex justify-center gap-6 mb-8">
            <div className="h-48 w-80 bg-muted rounded-xl animate-pulse" />
            <div className="h-48 w-80 bg-muted rounded-xl animate-pulse" />
          </div>
        ) : latestData ? (
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="flex gap-6 flex-wrap justify-center">
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
            {latestData.water_level !== null && latestData.water_level !== undefined && (
              <div className="w-full max-w-md">
                <MetricCard
                  title="Level Air"
                  value={latestData.water_level.toFixed(1)}
                  unit="cm"
                  icon={Ruler}
                  status="normal"
                  range="-"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 mb-8">
            <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Belum Ada Data</h3>
            <p className="text-muted-foreground">
              Menunggu data dari sensor IoT...
            </p>
          </div>
        )}

        {/* Chart Section */}
        <Card className="mb-8 border-0 shadow-lg overflow-hidden bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                Grafik Perubahan Suhu & pH
              </CardTitle>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-chart-1" />
                  <span className="text-muted-foreground">Suhu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-chart-2" />
                  <span className="text-muted-foreground">pH</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {chartData.length > 0 ? (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none rounded-lg" />
                <ResponsiveContainer width="100%" height={450}>
                  <LineChart 
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="hsl(var(--border))" 
                      strokeOpacity={0.3}
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      dy={10}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      label={{ 
                        value: 'Suhu (°C)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: 'hsl(var(--chart-1))', fontWeight: 600 }
                      }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      label={{ 
                        value: 'pH', 
                        angle: 90, 
                        position: 'insideRight',
                        style: { fill: 'hsl(var(--chart-2))', fontWeight: 600 }
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 8px 16px -4px hsl(var(--foreground) / 0.1)',
                        padding: '12px'
                      }}
                      labelStyle={{ 
                        color: 'hsl(var(--foreground))',
                        fontWeight: 600,
                        marginBottom: '8px'
                      }}
                      itemStyle={{
                        padding: '4px 0'
                      }}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="hsl(var(--chart-1))" 
                      name="Suhu (°C)" 
                      strokeWidth={3}
                      dot={{ 
                        fill: 'hsl(var(--chart-1))',
                        strokeWidth: 2,
                        r: 4,
                        stroke: 'hsl(var(--card))'
                      }}
                      activeDot={{ 
                        r: 6,
                        strokeWidth: 2,
                        stroke: 'hsl(var(--card))'
                      }}
                      fill="url(#colorTemp)"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="ph" 
                      stroke="hsl(var(--chart-2))" 
                      name="pH" 
                      strokeWidth={3}
                      dot={{ 
                        fill: 'hsl(var(--chart-2))',
                        strokeWidth: 2,
                        r: 4,
                        stroke: 'hsl(var(--card))'
                      }}
                      activeDot={{ 
                        r: 6,
                        strokeWidth: 2,
                        stroke: 'hsl(var(--card))'
                      }}
                      fill="url(#colorPh)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/30 rounded-lg">
                <TrendingUp className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">Belum ada data untuk ditampilkan</p>
                <p className="text-muted-foreground/70 text-sm mt-2">Grafik akan muncul setelah data tersedia</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="p-6 bg-card rounded-xl border border-border">
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
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;