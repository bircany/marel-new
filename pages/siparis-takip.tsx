export const metadata = { title: "Sipariş Takibi | Marel Plise Perde" };

export default function TrackingPage() {
  return null;
}

export function getServerSideProps() {
  return { redirect: { destination: "/", permanent: false } };
}
