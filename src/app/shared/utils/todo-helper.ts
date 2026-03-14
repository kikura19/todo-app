import { Category } from '../../models/todo.model';

export class CategoryUtil {
  // 区分に応じたラベル（絵文字付き）を返す
  static getLabel(category: Category): string {
    const labels: { [key in Category]: string } = {
      [Category.WORK]: '💼 仕事',
      [Category.PERSONAL]: '🏠 個人',
      [Category.STUDY]: '📖 学習',
      [Category.OTHER]: '☕ その他'
    };
    return labels[category] || '❓ 不明';
  }

  // 区分に応じた背景色を返す（AG GridのcellStyle用）
  static getBgColor(category: Category): string {
    switch (category) {
      case Category.WORK: return '#e3f2fd'; // 薄い青
      case Category.PERSONAL: return '#f1f8e9'; // 薄い緑
      default: return 'transparent';
    }
  }
}