-- =====================================================
--  CREATE TABLE SENSOR DATA (untuk monitoring kualitas air)
-- =====================================================

CREATE TABLE public.sensor_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temperature DECIMAL(5,2) NOT NULL,          -- Suhu air (°C)
  ph DECIMAL(4,2) NOT NULL,                   -- Derajat keasaman
  dissolved_oxygen DECIMAL(5,2),              -- Oksigen terlarut (mg/L)
  salinity DECIMAL(5,2),                      -- Salinitas (ppt)
  turbidity DECIMAL(5,2),                     -- Kekeruhan (NTU)
  ammonia DECIMAL(5,3),                       -- Kadar amonia (mg/L)
  water_level DECIMAL(6,2),                   -- Ketinggian air (cm)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
--  ROW LEVEL SECURITY (RLS) & POLICIES
-- =====================================================

-- Aktifkan keamanan baris
ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;

-- Izinkan semua orang melihat data (untuk web monitoring publik)
CREATE POLICY "Anyone can view sensor data" 
ON public.sensor_data 
FOR SELECT 
USING (true);

-- Izinkan perangkat IoT menambahkan data baru
CREATE POLICY "Anyone can insert sensor data" 
ON public.sensor_data 
FOR INSERT 
WITH CHECK (true);

-- =====================================================
--  INDEX & REALTIME SETUP
-- =====================================================

-- Buat index agar query berdasarkan waktu lebih cepat
CREATE INDEX idx_sensor_data_created_at 
ON public.sensor_data(created_at DESC);

-- Aktifkan fitur realtime Supabase (agar web dapat update otomatis)
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_data;

-- =====================================================
--  SAMPLE DATA (contoh data awal)
-- =====================================================

INSERT INTO public.sensor_data 
(temperature, ph, dissolved_oxygen, salinity, turbidity, ammonia, water_level)
VALUES 
  (28.5, 7.8, 6.5, 15.2, 12.3, 0.15, 125.5),
  (29.2, 7.6, 6.8, 15.8, 10.5, 0.12, 128.2),
  (27.8, 8.0, 7.2, 14.9, 11.8, 0.18, 123.7);
