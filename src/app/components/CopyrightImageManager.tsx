import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import type { CopyrightArea } from '@/types';

interface CopyrightImageManagerProps {
  copyrightArea: CopyrightArea;
  onCopyrightChange: (partial: Partial<CopyrightArea>) => void;
}

export function CopyrightImageManager({ copyrightArea, onCopyrightChange }: CopyrightImageManagerProps) {
  const update = (field: keyof CopyrightArea, value: string) => {
    onCopyrightChange({ [field]: value });
  };

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-lg">하단 문구 (카피라이트)</h3>
      <p className="text-sm text-gray-500">
        첨부 이미지처럼 좌·중앙·우 3단 구성으로 표시됩니다. 각 항목을 입력하세요.
      </p>

      <div className="space-y-2">
        <Label>좌측1</Label>
        <Input
          value={copyrightArea?.left1 ?? ''}
          onChange={(e) => update('left1', e.target.value)}
          placeholder="가장 개혁적인 도지사"
        />
      </div>
      <div className="space-y-2">
        <Label>좌측2</Label>
        <Input
          value={copyrightArea?.left2 ?? ''}
          onChange={(e) => update('left2', e.target.value)}
          placeholder="일 잘하는 따듯한 도지사"
        />
      </div>
      <div className="space-y-2">
        <Label>강조단어 (1줄)</Label>
        <Input
          value={copyrightArea?.highlightWord ?? ''}
          onChange={(e) => update('highlightWord', e.target.value)}
          placeholder="도지사"
        />
      </div>
      <div className="space-y-2">
        <Label>강조단어 (2줄)</Label>
        <Input
          value={copyrightArea?.highlightWord2 ?? ''}
          onChange={(e) => update('highlightWord2', e.target.value)}
          placeholder="도지사"
        />
      </div>

      <div className="space-y-2">
        <Label>중앙 이름</Label>
        <Input
          value={copyrightArea?.centerName ?? ''}
          onChange={(e) => update('centerName', e.target.value)}
          placeholder="이원택"
        />
      </div>

      <div className="space-y-2">
        <Label>우측 경력 1</Label>
        <Input
          value={copyrightArea?.right1 ?? ''}
          onChange={(e) => update('right1', e.target.value)}
          placeholder="제21대, 22대 국회의원"
        />
      </div>
      <div className="space-y-2">
        <Label>우측 경력 2</Label>
        <Input
          value={copyrightArea?.right2 ?? ''}
          onChange={(e) => update('right2', e.target.value)}
          placeholder="전) 전라북도 정부부지사"
        />
      </div>
      <div className="space-y-2">
        <Label>우측 경력 3</Label>
        <Input
          value={copyrightArea?.right3 ?? ''}
          onChange={(e) => update('right3', e.target.value)}
          placeholder="전) 청와대 행정관"
        />
      </div>
    </div>
  );
}
