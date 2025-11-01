-- Create table for storing sensor data (temperature and pH)
CREATE TABLE public.sensor_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  temperature DECIMAL(5,2) NOT NULL,
  ph DECIMAL(4,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read sensor data (public monitoring)
CREATE POLICY "Anyone can view sensor data" 
ON public.sensor_data 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert sensor data (from IoT devices)
CREATE POLICY "Anyone can insert sensor data" 
ON public.sensor_data 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries on created_at
CREATE INDEX idx_sensor_data_created_at ON public.sensor_data(created_at DESC);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_data;
