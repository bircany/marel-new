import type { GetServerSideProps } from "next";

/** Legacy campaign URL: show live Diamond records from the canonical catalog. */
export default function DiamondSeriesAlias() { return null; }

export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/urunler?filter=diamond", permanent: true } });


