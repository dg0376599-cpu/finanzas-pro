export const revalidate = 1800; // cache 30 min en servidor

export async function GET() {
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      next: { revalidate: 1800 },
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Response.json({
      rate: data.promedio,
      buy: data.promedioCompra,
      sell: data.promedioVenta,
      updatedAt: data.fechaActualizacion,
    });
  } catch (err) {
    return Response.json(
      { rate: null, error: 'No se pudo obtener la tasa BCV' },
      { status: 500 }
    );
  }
}
