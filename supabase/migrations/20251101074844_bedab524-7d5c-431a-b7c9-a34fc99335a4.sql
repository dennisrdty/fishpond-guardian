-- Add more monitoring parameters to sensor_data table
ALTER TABLE public.sensor_data 
ADD COLUMN dissolved_oxygen DECIMAL(5,2),
ADD COLUMN salinity DECIMAL(5,2),
ADD COLUMN turbidity DECIMAL(6,2),
ADD COLUMN ammonia DECIMAL(5,3),
ADD COLUMN water_level DECIMAL(6,2);

-- Add helpful comments
COMMENT ON COLUMN public.sensor_data.dissolved_oxygen IS 'Dissolved Oxygen in mg/L';
COMMENT ON COLUMN public.sensor_data.salinity IS 'Salinity in ppt (parts per thousand)';
COMMENT ON COLUMN public.sensor_data.turbidity IS 'Turbidity in NTU';
COMMENT ON COLUMN public.sensor_data.ammonia IS 'Ammonia (NH3) in mg/L';
COMMENT ON COLUMN public.sensor_data.water_level IS 'Water level in cm';