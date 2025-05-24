import Link from "next/link";
import Navbar from "../../components/Navbar";

interface PageProps {
  params: { id: string };
}

export default function Page({ params: { id } }: PageProps) {
  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center gap-3">
        <p className="font-bold">Vous avez quitté cette réunion.</p>
        <Link
          href={`/meeting/${id}`}
          className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
        >
          Rejoindre à nouveau
        </Link>
      </div>
    </>
  );
}
