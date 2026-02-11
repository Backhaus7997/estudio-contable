import ClienteDetalle from "../ui/ClienteDetalle";

export default function Page({ params }: { params: { id: string } }) {
  return <ClienteDetalle id={params.id} />;
}