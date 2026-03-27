export function getPagination(page?: string, size?: string) {
 
    const limit = size ? +parseInt(size) : 10
    
    const offset = page ? (parseInt(page) - 1) * limit : 0

  return { limit, offset };
}