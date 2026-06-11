import { GreenHomesProjectWorkspace } from "@/components/greenHomes/GreenHomesProjectWorkspace";

type Props = {
  projectId: string;
};

export function CertificationReadOnlyWorkspace({ projectId }: Props) {
  return <GreenHomesProjectWorkspace projectId={projectId} forceReadOnly embedded />;
}
