export const environment = {
  production: true,
  // En producción (Docker/nginx) el frontend y backend suelen estar detrás del mismo host
  // Ajusta si backend está en otro dominio
  apiBaseUrl: 'http://localhost:3000/api/v1',
};

