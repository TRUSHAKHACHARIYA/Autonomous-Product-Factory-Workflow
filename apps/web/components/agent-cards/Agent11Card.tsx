"use client";

import { useState, useMemo } from "react";

interface GeneratedFile {
  path: string;
  content: string;
}

interface ModuleCodeOutput {
  module_name: string;
  files: GeneratedFile[];
}

interface Agent11Output {
  modules?: ModuleCodeOutput[];
}

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Agent11Output;
  model_used?: string;
  duration_ms?: number;
}

interface Agent11CardProps {
  agent: AgentOutput;
}

type Tab = string;

function getFileExtension(path: string): string {
  const parts = path.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

function getFileIcon(ext: string): string {
  switch (ext) {
    case "py":
      return "PY";
    case "ts":
      return "TS";
    case "js":
      return "JS";
    case "go":
      return "GO";
    case "rs":
      return "RS";
    case "sql":
      return "SQ";
    case "json":
      return "{}";
    case "yaml":
    case "yml":
      return "YL";
    default:
      return "#";
  }
}

function getFileIconColor(ext: string): string {
  switch (ext) {
    case "py":
      return "bg-green-100 text-green-700";
    case "ts":
      return "bg-blue-100 text-blue-700";
    case "js":
      return "bg-yellow-100 text-yellow-700";
    case "go":
      return "bg-cyan-100 text-cyan-700";
    case "rs":
      return "bg-orange-100 text-orange-700";
    case "sql":
      return "bg-purple-100 text-purple-700";
    case "json":
      return "bg-yellow-100 text-yellow-700";
    case "yaml":
    case "yml":
      return "bg-pink-100 text-pink-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function FileTree({
  files,
  selectedFile,
  onSelectFile,
}: {
  files: GeneratedFile[];
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}) {
  const tree = useMemo(() => {
    const root: Record<string, unknown> = {};
    for (const f of files) {
      const parts = f.path.split("/");
      let current = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          (current as Record<string, string>)[part] = f.path;
        } else {
          if (!current[part]) current[part] = {};
          current = current[part] as Record<string, unknown>;
        }
      }
    }
    return root;
  }, [files]);

  function renderNode(node: Record<string, unknown>, depth: number) {
    const entries = Object.entries(node).sort(([, a], [, b]) => {
      const aIsDir = typeof a === "object";
      const bIsDir = typeof b === "object";
      if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
      return a.toString().localeCompare(b.toString());
    });

    return entries.map(([name, value]) => {
      if (typeof value === "string") {
        const ext = getFileExtension(name);
        const isSelected = value === selectedFile;
        return (
          <button
            key={value}
            onClick={() => onSelectFile(value)}
            className={`w-full text-left flex items-center gap-2 px-2 py-1 rounded text-xs font-mono transition-colors ${
              isSelected
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            <span
              className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${getFileIconColor(ext)}`}
            >
              {getFileIcon(ext)}
            </span>
            {name}
          </button>
        );
      }

      return (
        <div key={name}>
          <div
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-500"
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            <svg
              className="w-3 h-3 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            {name}
          </div>
          {renderNode(value as Record<string, unknown>, depth + 1)}
        </div>
      );
    });
  }

  return <div className="space-y-0.5">{renderNode(tree, 0)}</div>;
}

function CodeViewer({ file }: { file: GeneratedFile }) {
  const lines = file.content.split("\n");
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">{file.path}</span>
        <span className="ml-auto text-[10px] text-gray-500">
          {lines.length} lines
        </span>
      </div>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-xs">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-gray-800/50">
                <td className="text-right pr-4 pl-4 py-0 text-gray-500 select-none font-mono w-[1%] whitespace-nowrap">
                  {i + 1}
                </td>
                <td className="pr-4 py-0 font-mono text-gray-300 whitespace-pre">
                  {line || " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ModuleSpinner({ moduleName }: { moduleName: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white border rounded-lg">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-gray-600">
        Generating <span className="font-medium">{moduleName}</span>...
      </span>
    </div>
  );
}

export function Agent11Card({ agent }: Agent11CardProps) {
  const out = agent.structured_output;
  const modules = out?.modules;

  if (!modules || modules.length === 0) {
    if (agent.status === "running") {
      return (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">
              Generating backend modules in parallel...
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ModuleSpinner moduleName="Auth Service" />
            <ModuleSpinner moduleName="User Module" />
            <ModuleSpinner moduleName="Payments Module" />
            <ModuleSpinner moduleName="Notifications Module" />
          </div>
        </div>
      );
    }
    return null;
  }

  const [activeTab, setActiveTab] = useState<Tab>(modules[0].module_name);
  const activeModule = modules.find((m) => m.module_name === activeTab) || modules[0];
  const [selectedFile, setSelectedFile] = useState<string | null>(
    activeModule.files[0]?.path || null,
  );

  const totalFiles = modules.reduce((acc, m) => acc + m.files.length, 0);

  return (
    <div className="p-4 space-y-4 text-sm">
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
          {modules.length} modules
        </span>
        <span>{totalFiles} files generated</span>
        {agent.duration_ms && (
          <span>{(agent.duration_ms / 1000).toFixed(1)}s total</span>
        )}
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto">
        {modules.map((m) => (
          <button
            key={m.module_name}
            onClick={() => {
              setActiveTab(m.module_name);
              setSelectedFile(m.files[0]?.path || null);
            }}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === m.module_name
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {m.module_name}
            <span className="ml-1.5 text-[10px] text-gray-400">
              {m.files.length}
            </span>
          </button>
        ))}
      </div>

      <div className="flex gap-4 min-h-[400px]">
        <div className="w-64 flex-shrink-0 border rounded-lg p-2 bg-gray-50 overflow-y-auto max-h-[600px]">
          <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
            Files
          </h4>
          <FileTree
            files={activeModule.files}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
          />
        </div>

        <div className="flex-1 min-w-0">
          {selectedFile ? (
            (() => {
              const file = activeModule.files.find((f) => f.path === selectedFile);
              return file ? (
                <CodeViewer file={file} />
              ) : (
                <div className="text-gray-400 text-xs p-8 text-center">
                  File not found
                </div>
              );
            })()
          ) : (
            <div className="text-gray-400 text-xs p-8 text-center">
              Select a file from the tree
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
