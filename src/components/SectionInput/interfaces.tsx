export interface SectionInputProps<T = any> {
  course: string; //title of the course
  data: string[]; //list of sections names
  dataHandler: T;
}
