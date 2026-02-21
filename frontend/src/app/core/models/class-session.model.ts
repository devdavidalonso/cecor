import { Course } from './course.model';
import { Location } from './location.model';

export interface ClassSession {
  id: number;
  courseId: number;
  course?: Course;
  locationId?: number;
  location?: Location;
  date: string; // ISO format YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  topic?: string;
  isCancelled?: boolean;
}
