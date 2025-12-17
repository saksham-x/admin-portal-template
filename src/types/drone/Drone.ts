import { Imagepath } from "../FilePath"

export interface Drone {
  id: number;
  title: string;
  description?: string | null;
  image_url?: string | null;
  image_path?:Imagepath | null;
  attributes?: any[] | Record<string, any> | null;
  is_active?: boolean | number;
  position?: number; 
}

export interface DroneView extends Drone {
  id: number;
}


