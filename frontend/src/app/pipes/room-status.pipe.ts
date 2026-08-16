import { Pipe, PipeTransform } from '@angular/core';

/** Mapping từ giá trị DB sang tiếng Việt cho Room status */
export const ROOM_STATUS_MAP: Record<string, { label: string; icon: string }> = {
  available:   { label: 'Còn trống',      icon: '🟢' },
  occupied:    { label: 'Đang có khách',  icon: '🔵' },
  maintenance: { label: 'Đang bảo trì',  icon: '🔴' },
};

@Pipe({ name: 'roomStatus', standalone: true })
export class RoomStatusPipe implements PipeTransform {
  transform(status: string, field: 'label' | 'icon' = 'label'): string {
    const entry = ROOM_STATUS_MAP[status];
    if (!entry) return status;
    return entry[field];
  }
}
