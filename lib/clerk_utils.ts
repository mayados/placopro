
// // Vérifier si l'utilisateur a l'un des rôles autorisés
// export function hasRole(payload: unknown, allowed: string[]): boolean {
//     // Extraire le rôle directement du payload JWT
//     const role = payload?.role;
    
//     // Vérifier si le rôle existe et s'il fait partie des rôles autorisés
//     return typeof role === 'string' && allowed.includes(role);
//   }

type JwtPayloadWithRole = { role: string };

export function hasRole(payload: unknown, allowed: string[]): boolean {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'role' in payload &&
    typeof (payload as JwtPayloadWithRole).role === 'string'
  ) {
    return allowed.includes((payload as JwtPayloadWithRole).role);
  }

  return false;
}
