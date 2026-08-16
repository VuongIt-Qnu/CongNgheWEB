import { Pipe, PipeTransform } from '@angular/core';
import { formatVNDate, formatVNDateTime, formatVNDateFull } from '../utils/date-format';

@Pipe({
  name: 'vnDate',
  standalone: true
})
export class VnDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined, mode: 'date' | 'time' | 'full' = 'date'): string {
    if (!value) return '';
    if (mode === 'time') return formatVNDateTime(value);
    if (mode === 'full') return formatVNDateFull(value);
    return formatVNDate(value);
  }
}
