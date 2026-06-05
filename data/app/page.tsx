import { AppShell } from "./components/AppShell";
import dataRaw from "../../public/data.json";
import { AppData } from "./types";

const data = dataRaw as unknown as AppData;

export default function Home() {
  return <AppShell data={data} />;
}
