import {
  Check,
  Edit,
  Eye,
  FileText,
  MoreVertical,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export type TableRowAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "success" | "danger" | "outline";
  disabled?: boolean;
  icon?: React.ReactNode;
};

interface TableRowActionsProps {
  actions: TableRowAction[];
}

const variantClassMap: Record<NonNullable<TableRowAction["variant"]>, string> = {
  primary: "action-btn-primary",
  success: "action-btn-success",
  danger: "action-btn-danger",
  outline: "action-btn-outline",
};

const getActionIcon = (action: TableRowAction) => {
  if (action.icon) return action.icon;
  const label = action.label.toLowerCase();
  if (label.includes("view")) return <Eye className="h-4 w-4" />;
  if (label.includes("edit")) return <Edit className="h-4 w-4" />;
  if (label.includes("remove") || label.includes("delete")) return <Trash2 className="h-4 w-4" />;
  if (label.includes("upload")) return <Upload className="h-4 w-4" />;
  if (label.includes("report")) return <FileText className="h-4 w-4" />;
  if (label.includes("approve") || label.includes("pass")) return <Check className="h-4 w-4" />;
  if (label.includes("fail") || label.includes("reject")) return <XCircle className="h-4 w-4" />;
  return <MoreVertical className="h-4 w-4" />;
};

const TableRowActions = ({ actions }: TableRowActionsProps) => {
  if (!actions.length) return null;

  const directActions = actions.length > 3 ? actions.slice(0, 2) : actions.slice(0, 3);
  const overflowActions = actions.length > 3 ? actions.slice(2) : [];

  const renderActionButton = (action: TableRowAction, index: number) => {
    const variantClass = variantClassMap[action.variant ?? "primary"];
    return (
      <Tooltip key={`${action.label}-${index}`}>
        <TooltipTrigger asChild>
          {action.href ? (
            <a
              href={action.disabled ? undefined : action.href}
              target="_blank"
              rel="noreferrer"
              className={`action-btn ${variantClass} p-2 ${action.disabled ? "pointer-events-none opacity-40" : ""}`}
              aria-label={action.label}
            >
              {getActionIcon(action)}
            </a>
          ) : (
            <button
              className={`action-btn ${variantClass} p-2`}
              onClick={action.onClick}
              disabled={action.disabled}
              aria-label={action.label}
            >
              {getActionIcon(action)}
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>{action.label}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5">
        {directActions.map((action, index) => renderActionButton(action, index))}
        {overflowActions.length > 0 && (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button className="action-btn action-btn-outline p-2" aria-label="More actions">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>More actions</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              {overflowActions.map((action, index) => (
                <div key={`${action.label}-overflow-${index}`}>
                  {action.href ? (
                    <DropdownMenuItem asChild disabled={action.disabled}>
                      <a href={action.href} target="_blank" rel="noreferrer">
                        {action.label}
                      </a>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={action.onClick} disabled={action.disabled}>
                      {action.label}
                    </DropdownMenuItem>
                  )}
                  {index < overflowActions.length - 1 && <DropdownMenuSeparator />}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </TooltipProvider>
  );
};

export default TableRowActions;
