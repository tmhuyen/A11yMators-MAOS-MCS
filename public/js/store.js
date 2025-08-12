export const data = {};  // will hold all step fields

export function set(path, value){
  data[path] = value;
}
export function get(path){
  return data[path];
}
