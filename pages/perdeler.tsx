import type { GetServerSideProps } from "next";

/** Legacy alias: the canonical catalog is /plise-perdeler. */
export default function PerdelerAlias() { return null; }

export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/plise-perdeler", permanent: true } });

