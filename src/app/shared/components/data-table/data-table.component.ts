import { Component, Input } from '@angular/core';
import { KeyValuePipe } from '@angular/common';

@Component({
  selector: 'bp-data-table',
  standalone: true,
  imports: [KeyValuePipe],
  template: `
    <table>
      @for (row of rows; track $index) {
        <tr>
          @for (cell of row | keyvalue; track cell.key) {
            <td>{{ cell.value }}</td>
          }
        </tr>
      }
    </table>
  `,
  styles: [`table { width: 100%; border-collapse: collapse; } td { border-bottom: 1px solid var(--bp-border); padding: 14px 10px; }`],
})
export class DataTableComponent {
  @Input() rows: Record<string, string | number | boolean>[] = [];
}
