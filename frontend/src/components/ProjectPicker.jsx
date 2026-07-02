import React from "react";
import { useProjects } from "../lib/projects";
import { ChevronDown, FolderKanban } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu";

export default function ProjectPicker() {
  const { projects, current, setCurrent } = useProjects();
  if (!current) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-gray-200 hover:border-gray-300 text-sm font-semibold" data-testid="project-picker">
          <FolderKanban className="w-4 h-4 text-[#7C3AED]" /> {current.name}
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-2xl">
        <DropdownMenuLabel className="text-xs text-gray-500">Switch project</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.map((p) => (
          <DropdownMenuItem
            key={p.project_id}
            onSelect={() => setCurrent(p)}
            className={`cursor-pointer ${p.project_id === current.project_id ? "bg-gray-50" : ""}`}
            data-testid={`project-picker-${p.project_id}`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899]" />
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-[11px] text-gray-500">{p.industry || "—"}</p>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
