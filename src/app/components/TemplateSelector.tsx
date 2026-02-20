import { Card } from "@/app/components/ui/card";
import { cn } from "@/app/components/ui/utils";
import { Square, Grid2x2, List, LayoutGrid } from 'lucide-react';

export type TemplateType = 'horizontal-card' | 'quad-layout' | 'vertical-list-card' | 'square-layout';

interface TemplateSelectorProps {
  selectedTemplate: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
}

const templates = [
  { id: 'horizontal-card' as TemplateType, number: 1, name: '2분할 레이아웃', description: '720 x 720px', aspectRatio: '1/1', icon: Square },
  { id: 'quad-layout' as TemplateType, number: 2, name: '4분할 레이아웃', description: '720 x 1200px', aspectRatio: '1/1', icon: Grid2x2 },
  { id: 'vertical-list-card' as TemplateType, number: 3, name: '세로 리스트 카드', description: '720 x 1200px', aspectRatio: '1/1', icon: List },
  { id: 'square-layout' as TemplateType, number: 4, name: '정사각형 레이아웃', description: '720 x 720px', aspectRatio: '1/1', icon: LayoutGrid },
];

export function TemplateSelector({ selectedTemplate, onTemplateChange }: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      {templates.map((template) => {
        const Icon = template.icon;
        return (
          <Card
            key={template.id}
            className={cn(
              "p-3 cursor-pointer transition-all hover:shadow-md",
              selectedTemplate === template.id ? "ring-2 ring-blue-600 bg-blue-50" : "hover:bg-gray-50"
            )}
            onClick={() => onTemplateChange(template.id)}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600 rounded w-10 h-10 flex-shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-0.5">{template.number}. {template.name}</h3>
                <p className="text-xs text-gray-500">{template.description}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}