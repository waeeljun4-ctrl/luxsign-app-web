<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\HeroSlide;
use App\Models\PortfolioProject;
use App\Models\Testimonial;
use Illuminate\Database\Seeder;

/**
 * Real catalog data exported from the local working database —
 * generated, not hand-written. Re-run the export if the local
 * catalog changes before the next deploy.
 */
class ProductionDataSeeder extends Seeder
{
    public function run(): void
    {
        $categories = array (
  0 => 
  array (
    'name' => 'قارمات مضيئة',
    'name_he' => 'שלטים מוארים',
    'name_en' => 'led qarma',
    'icon' => '🔆',
    'image' => 'categories/cat-1.png',
    'key' => 'sign_q',
    'sort_order' => 1,
    'is_active' => true,
  ),
  1 => 
  array (
    'name' => 'أحرف ديكور',
    'name_he' => 'אותיות דקורטיביות',
    'name_en' => NULL,
    'icon' => '🔤',
    'image' => 'categories/cat-2.png',
    'key' => 'sign_h',
    'sort_order' => 2,
    'is_active' => true,
  ),
  2 => 
  array (
    'name' => 'لوحات CNC',
    'name_he' => 'שלטי CNC',
    'name_en' => NULL,
    'icon' => '⚙️',
    'image' => 'categories/cat-3.png',
    'key' => 'sign_c',
    'sort_order' => 3,
    'is_active' => true,
  ),
  3 => 
  array (
    'name' => 'مضيء متحرك',
    'name_he' => 'מואר נע',
    'name_en' => NULL,
    'icon' => '✨',
    'image' => 'categories/cat-4.png',
    'key' => 'sign_m',
    'sort_order' => 4,
    'is_active' => true,
  ),
  4 => 
  array (
    'name' => 'ديكور إسلامي',
    'name_he' => 'דקורציה אסלאמית',
    'name_en' => NULL,
    'icon' => '🕌',
    'image' => 'categories/cat-5.png',
    'key' => 'islam',
    'sort_order' => 5,
    'is_active' => true,
  ),
  5 => 
  array (
    'name' => 'لوحات سيارات',
    'name_he' => 'שלטי רכב',
    'name_en' => NULL,
    'icon' => '🚗',
    'image' => 'categories/cat-6.png',
    'key' => 'car',
    'sort_order' => 6,
    'is_active' => true,
  ),
  6 => 
  array (
    'name' => 'مضيء ثابت',
    'name_he' => 'מואר קבוע',
    'name_en' => NULL,
    'icon' => NULL,
    'image' => 'categories/cat-9.png',
    'key' => 'w1',
    'sort_order' => 0,
    'is_active' => true,
  ),
  7 => 
  array (
    'name' => 'خشبيات',
    'name_he' => 'מוצרי עץ',
    'name_en' => NULL,
    'icon' => NULL,
    'image' => NULL,
    'key' => 'kashab',
    'sort_order' => 0,
    'is_active' => true,
  ),
);
        $categoryIds = [];
        foreach ($categories as $cat) {
            $categoryIds[$cat['key']] = Category::updateOrCreate(['key' => $cat['key']], $cat)->id;
        }

        $products = array (
  0 => 
  array (
    'name' => 'قارمة ثابتة على الوجهين (تفصيل)',
    'name_he' => 'שלט מואר קבוע דו-צדדי (בהתאמה אישית)',
    'name_en' => NULL,
    'description' => 'قارمة مضيئة ثابتة على الوجهين — تصميم حسب الطلب، أي حجم حتى 150×150 سم',
    'description_he' => 'שלט מואר קבוע ודו-צדדי — עיצוב לפי הזמנה, בכל גודל עד 150×150 ס"מ',
    'description_en' => NULL,
    'icon' => '💡',
    'image' => NULL,
    'images' => 
    array (
    ),
    'video_url' => NULL,
    'video' => NULL,
    'badge' => NULL,
    'badge_he' => NULL,
    'badge_en' => NULL,
    'pricing_type' => 'fixed',
    'is_custom' => true,
    'show_ref_images' => true,
    'price' => 0.0,
    'wholesale_price' => NULL,
    'compare_price' => NULL,
    'min_price' => 1000.0,
    'show_min_price' => true,
    'preset_sizes' => NULL,
    'compare_prices' => NULL,
    'size_prices' => NULL,
    'max_size' => NULL,
    'fixed_size_label' => NULL,
    'qty_labels' => NULL,
    'qty_labels_he' => NULL,
    'qty_labels_en' => NULL,
    'shape' => 'circle',
    'designer_type' => 'none',
    'is_active' => true,
    'track_stock' => false,
    'stock_quantity' => 0,
    'sort_order' => 0,
    'spec_fields' => 
    array (
      0 => 
      array (
        'label' => 'الطول',
        'label_he' => 'אורך',
        'label_en' => NULL,
        'field_type' => 'number',
        'preview_shape' => NULL,
        'options' => NULL,
        'options_he' => NULL,
        'options_en' => NULL,
        'is_required' => false,
        'sort_order' => 3,
      ),
      1 => 
      array (
        'label' => 'العرض',
        'label_he' => 'רוחב',
        'label_en' => NULL,
        'field_type' => 'text',
        'preview_shape' => NULL,
        'options' => NULL,
        'options_he' => NULL,
        'options_en' => NULL,
        'is_required' => false,
        'sort_order' => 4,
      ),
      2 => 
      array (
        'label' => 'نوع الاضائة',
        'label_he' => 'סוג התאורה',
        'label_en' => NULL,
        'field_type' => 'select',
        'preview_shape' => NULL,
        'options' => 
        array (
          0 => 'ابيض',
          1 => 'worm(دافئ)',
          2 => 'cool',
        ),
        'options_he' => 
        array (
          0 => 'לבן',
          1 => 'חם',
          2 => 'קריר',
        ),
        'options_en' => NULL,
        'is_required' => false,
        'sort_order' => 5,
      ),
      3 => 
      array (
        'label' => 'ملاحظات',
        'label_he' => 'הערות',
        'label_en' => NULL,
        'field_type' => 'text',
        'preview_shape' => NULL,
        'options' => NULL,
        'options_he' => NULL,
        'options_en' => NULL,
        'is_required' => false,
        'sort_order' => 6,
      ),
    ),
    'category_key' => 'sign_q',
  ),
  1 => 
  array (
    'name' => 'قارمة  مضيئة احرف بارزة',
    'name_he' => 'שלט מואר עם אותיות בולטות',
    'name_en' => 'arma',
    'description' => 'شكل مستطيل — مناسب للمحلات الكبيرة',
    'description_he' => 'צורה מלבנית — מתאים לחנויות גדולות',
    'description_en' => 'arma fir you',
    'icon' => '🟨',
    'image' => NULL,
    'images' => NULL,
    'video_url' => NULL,
    'video' => NULL,
    'badge' => NULL,
    'badge_he' => NULL,
    'badge_en' => NULL,
    'pricing_type' => 'fixed',
    'is_custom' => true,
    'show_ref_images' => false,
    'price' => 0.0,
    'wholesale_price' => NULL,
    'compare_price' => NULL,
    'min_price' => NULL,
    'show_min_price' => false,
    'preset_sizes' => 
    array (
      0 => 50,
      1 => 70,
      2 => 90,
    ),
    'compare_prices' => NULL,
    'size_prices' => NULL,
    'max_size' => NULL,
    'fixed_size_label' => NULL,
    'qty_labels' => NULL,
    'qty_labels_he' => NULL,
    'qty_labels_en' => NULL,
    'shape' => 'rectangle',
    'designer_type' => 'sign',
    'is_active' => true,
    'track_stock' => false,
    'stock_quantity' => 0,
    'sort_order' => 1,
    'spec_fields' => 
    array (
    ),
    'category_key' => 'sign_q',
  ),
  2 => 
  array (
    'name' => 'أحرف ديكور بارزة (1سم)',
    'name_he' => 'אותיות דקורטיביות בולטות (1 ס"מ)',
    'name_en' => NULL,
    'description' => 'أحرف بالحجم والشكل حسب طلبك — تركيب احترافي',
    'description_he' => 'אותיות בגודל ובצורה לפי בקשתך — התקנה מקצועית',
    'description_en' => NULL,
    'icon' => '🔤',
    'image' => NULL,
    'images' => NULL,
    'video_url' => NULL,
    'video' => NULL,
    'badge' => NULL,
    'badge_he' => NULL,
    'badge_en' => NULL,
    'pricing_type' => 'fixed',
    'is_custom' => true,
    'show_ref_images' => false,
    'price' => 0.0,
    'wholesale_price' => NULL,
    'compare_price' => NULL,
    'min_price' => NULL,
    'show_min_price' => false,
    'preset_sizes' => 
    array (
      0 => 30,
      1 => 50,
      2 => 70,
      3 => 100,
    ),
    'compare_prices' => NULL,
    'size_prices' => NULL,
    'max_size' => NULL,
    'fixed_size_label' => NULL,
    'qty_labels' => NULL,
    'qty_labels_he' => NULL,
    'qty_labels_en' => NULL,
    'shape' => 'rectangle',
    'designer_type' => 'sign',
    'is_active' => true,
    'track_stock' => false,
    'stock_quantity' => 0,
    'sort_order' => 2,
    'spec_fields' => 
    array (
    ),
    'category_key' => 'sign_h',
  ),
  3 => 
  array (
    'name' => 'أحرف سمك ٣ سم',
    'name_he' => 'אותיות בעובי 3 ס"מ',
    'name_en' => NULL,
    'description' => 'أحرف مضيئة بسمك ٣ سانتي — جودة فاخرة',
    'description_he' => 'אותיות מוארות בעובי 3 ס"מ — איכות יוקרתית',
    'description_en' => NULL,
    'icon' => '🌟',
    'image' => NULL,
    'images' => NULL,
    'video_url' => NULL,
    'video' => NULL,
    'badge' => NULL,
    'badge_he' => NULL,
    'badge_en' => NULL,
    'pricing_type' => 'fixed',
    'is_custom' => true,
    'show_ref_images' => false,
    'price' => 0.0,
    'wholesale_price' => NULL,
    'compare_price' => NULL,
    'min_price' => NULL,
    'show_min_price' => false,
    'preset_sizes' => 
    array (
      0 => 30,
      1 => 50,
      2 => 70,
    ),
    'compare_prices' => NULL,
    'size_prices' => NULL,
    'max_size' => NULL,
    'fixed_size_label' => NULL,
    'qty_labels' => NULL,
    'qty_labels_he' => NULL,
    'qty_labels_en' => NULL,
    'shape' => 'rectangle',
    'designer_type' => 'sign',
    'is_active' => true,
    'track_stock' => false,
    'stock_quantity' => 0,
    'sort_order' => 3,
    'spec_fields' => 
    array (
    ),
    'category_key' => 'sign_h',
  ),
  4 => 
  array (
    'name' => 'لوحة CNC اقتصادية',
    'name_he' => 'שלט CNC חסכוני',
    'name_en' => NULL,
    'description' => 'تفصيل حسب الطلب لتسويق محلك',
    'description_he' => 'בהתאמה אישית לשיווק העסק שלך',
    'description_en' => NULL,
    'icon' => '⚙️',
    'image' => NULL,
    'images' => NULL,
    'video_url' => NULL,
    'video' => NULL,
    'badge' => 'اقتصادي',
    'badge_he' => 'חסכוני',
    'badge_en' => NULL,
    'pricing_type' => 'fixed',
    'is_custom' => true,
    'show_ref_images' => false,
    'price' => 0.0,
    'wholesale_price' => NULL,
    'compare_price' => NULL,
    'min_price' => NULL,
    'show_min_price' => false,
    'preset_sizes' => 
    array (
      0 => 40,
      1 => 60,
      2 => 80,
      3 => 100,
    ),
    'compare_prices' => NULL,
    'size_prices' => NULL,
    'max_size' => NULL,
    'fixed_size_label' => NULL,
    'qty_labels' => NULL,
    'qty_labels_he' => NULL,
    'qty_labels_en' => NULL,
    'shape' => 'rectangle',
    'designer_type' => 'sign',
    'is_active' => true,
    'track_stock' => false,
    'stock_quantity' => 0,
    'sort_order' => 4,
    'spec_fields' => 
    array (
    ),
    'category_key' => 'sign_c',
  ),
  5 => 
  array (
    'name' => 'قارمة متحركة على الاتجاهين',
    'name_he' => 'שלט מואר נע לשני הכיוונים',
    'name_en' => NULL,
    'description' => 'إضاءة LED متحركة تجذب الأنظار',
    'description_he' => 'תאורת LED נעה שמושכת את העין',
    'description_en' => NULL,
    'icon' => '✨',
    'image' => 'products/prod-7.png',
    'images' => NULL,
    'video_url' => NULL,
    'video' => NULL,
    'badge' => NULL,
    'badge_he' => NULL,
    'badge_en' => NULL,
    'pricing_type' => 'fixed_per_size',
    'is_custom' => false,
    'show_ref_images' => false,
    'price' => 800.0,
    'wholesale_price' => NULL,
    'compare_price' => NULL,
    'min_price' => NULL,
    'show_min_price' => false,
    'preset_sizes' => 
    array (
      0 => 60,
      1 => 50,
      2 => 40,
    ),
    'compare_prices' => 
    array (
      0 => 1200,
      1 => 1000,
      2 => 900,
    ),
    'size_prices' => 
    array (
      0 => 800,
      1 => 700,
      2 => 600,
    ),
    'max_size' => NULL,
    'fixed_size_label' => NULL,
    'qty_labels' => NULL,
    'qty_labels_he' => NULL,
    'qty_labels_en' => NULL,
    'shape' => 'circle',
    'designer_type' => 'none',
    'is_active' => true,
    'track_stock' => false,
    'stock_quantity' => 0,
    'sort_order' => 5,
    'spec_fields' => 
    array (
    ),
    'category_key' => 'sign_m',
  ),
  6 => 
  array (
    'name' => 'لوحة آية قرآنية',
    'name_he' => 'שלט עם פסוק מהקוראן',
    'name_en' => NULL,
    'description' => 'حجم 90x40 سم - شامل التوصيل لجميع مناطق الضفة',
    'description_he' => 'גודל 90x40 ס"מ - כולל משלוח לכל אזורי הגדה',
    'description_en' => NULL,
    'icon' => '🕌',
    'image' => NULL,
    'images' => NULL,
    'video_url' => NULL,
    'video' => NULL,
    'badge' => 'شامل التوصيل',
    'badge_he' => 'כולל משלוח',
    'badge_en' => NULL,
    'pricing_type' => 'fixed_per_size',
    'is_custom' => false,
    'show_ref_images' => false,
    'price' => 300.0,
    'wholesale_price' => NULL,
    'compare_price' => NULL,
    'min_price' => NULL,
    'show_min_price' => false,
    'preset_sizes' => 
    array (
      0 => '40×90',
    ),
    'compare_prices' => 
    array (
      0 => 350,
    ),
    'size_prices' => 
    array (
      0 => 300,
    ),
    'max_size' => NULL,
    'fixed_size_label' => NULL,
    'qty_labels' => NULL,
    'qty_labels_he' => NULL,
    'qty_labels_en' => NULL,
    'shape' => 'rectangle',
    'designer_type' => 'sign',
    'is_active' => true,
    'track_stock' => false,
    'stock_quantity' => 0,
    'sort_order' => 6,
    'spec_fields' => 
    array (
    ),
    'category_key' => 'islam',
  ),
  7 => 
  array (
    'name' => 'شباك الاقصى',
    'name_he' => 'חלון אל-אקצא',
    'name_en' => NULL,
    'description' => 'شكل نافذة تراثية CNC بإضاءة دافئة',
    'description_he' => 'עיצוב חלון מסורתי CNC עם תאורה חמימה',
    'description_en' => NULL,
    'icon' => '🌟',
    'image' => NULL,
    'images' => NULL,
    'video_url' => NULL,
    'video' => NULL,
    'badge' => 'جديد',
    'badge_he' => 'חדש',
    'badge_en' => NULL,
    'pricing_type' => 'fixed_per_size',
    'is_custom' => false,
    'show_ref_images' => false,
    'price' => 250.0,
    'wholesale_price' => NULL,
    'compare_price' => NULL,
    'min_price' => NULL,
    'show_min_price' => false,
    'preset_sizes' => 
    array (
      0 => '55×25',
      1 => '34×70',
    ),
    'compare_prices' => 
    array (
      0 => 300,
      1 => 396,
    ),
    'size_prices' => 
    array (
      0 => 250,
      1 => 350,
    ),
    'max_size' => NULL,
    'fixed_size_label' => NULL,
    'qty_labels' => 
    array (
      0 => '1',
      1 => '2',
    ),
    'qty_labels_he' => NULL,
    'qty_labels_en' => NULL,
    'shape' => 'rectangle',
    'designer_type' => 'sign',
    'is_active' => true,
    'track_stock' => false,
    'stock_quantity' => 0,
    'sort_order' => 7,
    'spec_fields' => 
    array (
    ),
    'category_key' => 'islam',
  ),
  8 => 
  array (
    'name' => 'لوحات سيارة ديكور',
    'name_he' => 'שלטי רכב דקורטיביים',
    'name_en' => NULL,
    'description' => 'رقم سيارتك بخلفية وألوان حسب طلبك',
    'description_he' => 'מספר הרכב שלך עם רקע וצבעים לפי בחירתך',
    'description_en' => NULL,
    'icon' => '🚗',
    'image' => 'products/prod-10.png',
    'images' => NULL,
    'video_url' => NULL,
    'video' => NULL,
    'badge' => 'الأكثر طلباً',
    'badge_he' => 'הכי מבוקש',
    'badge_en' => NULL,
    'pricing_type' => 'plate_qty',
    'is_custom' => false,
    'show_ref_images' => false,
    'price' => 100.0,
    'wholesale_price' => NULL,
    'compare_price' => NULL,
    'min_price' => NULL,
    'show_min_price' => false,
    'preset_sizes' => 
    array (
      0 => 100,
      1 => 150,
      2 => 220,
      3 => 300,
    ),
    'compare_prices' => NULL,
    'size_prices' => NULL,
    'max_size' => NULL,
    'fixed_size_label' => NULL,
    'qty_labels' => 
    array (
      0 => 'نمرة واحدة',
      1 => 'نمرتين',
      2 => '3 نمرات',
      3 => '4 نمرات',
    ),
    'qty_labels_he' => 
    array (
      0 => 'לוחית אחת',
      1 => 'שתי לוחיות',
      2 => '3 לוחיות',
      3 => '4 לוחיות',
    ),
    'qty_labels_en' => NULL,
    'shape' => 'rectangle',
    'designer_type' => 'plate',
    'is_active' => true,
    'track_stock' => false,
    'stock_quantity' => 0,
    'sort_order' => 8,
    'spec_fields' => 
    array (
    ),
    'category_key' => 'car',
  ),
  9 => 
  array (
    'name' => 'قارمة ثابتة على الوجهين - أحجام ثابتة',
    'name_he' => 'שלט מואר קבוע דו-צדדי - מידות קבועות',
    'name_en' => NULL,
    'description' => 'قارمة مضيئة ثابتة محفورة ومضيئة على الوجهين - تسعير حسب الحجم',
    'description_he' => 'שלט מואר קבוע, חרוט ומואר משני הצדדים - תמחור לפי גודל',
    'description_en' => NULL,
    'icon' => '🪟',
    'image' => NULL,
    'images' => NULL,
    'video_url' => NULL,
    'video' => NULL,
    'badge' => NULL,
    'badge_he' => NULL,
    'badge_en' => NULL,
    'pricing_type' => 'fixed_per_size',
    'is_custom' => false,
    'show_ref_images' => false,
    'price' => 600.0,
    'wholesale_price' => NULL,
    'compare_price' => NULL,
    'min_price' => NULL,
    'show_min_price' => false,
    'preset_sizes' => 
    array (
      0 => 60,
      1 => 70,
      2 => 80,
      3 => 100,
    ),
    'compare_prices' => 
    array (
      0 => 950,
      1 => 1100,
      2 => 1300,
      3 => 1500,
    ),
    'size_prices' => 
    array (
      0 => 600,
      1 => 700,
      2 => 800,
      3 => 1000,
    ),
    'max_size' => NULL,
    'fixed_size_label' => NULL,
    'qty_labels' => NULL,
    'qty_labels_he' => NULL,
    'qty_labels_en' => NULL,
    'shape' => 'circle',
    'designer_type' => 'none',
    'is_active' => true,
    'track_stock' => false,
    'stock_quantity' => 0,
    'sort_order' => 9,
    'spec_fields' => 
    array (
    ),
    'category_key' => 'w1',
  ),
  10 => 
  array (
    'name' => 'مكعب متحرك',
    'name_he' => 'קובייה נעה',
    'name_en' => NULL,
    'description' => NULL,
    'description_he' => NULL,
    'description_en' => NULL,
    'icon' => NULL,
    'image' => NULL,
    'images' => NULL,
    'video_url' => NULL,
    'video' => NULL,
    'badge' => NULL,
    'badge_he' => NULL,
    'badge_en' => NULL,
    'pricing_type' => 'plate_qty',
    'is_custom' => false,
    'show_ref_images' => false,
    'price' => 1500.0,
    'wholesale_price' => NULL,
    'compare_price' => NULL,
    'min_price' => NULL,
    'show_min_price' => false,
    'preset_sizes' => 
    array (
      0 => 1500,
      1 => 2000,
      2 => 3000,
    ),
    'compare_prices' => NULL,
    'size_prices' => NULL,
    'max_size' => NULL,
    'fixed_size_label' => NULL,
    'qty_labels' => 
    array (
      0 => 'مكعب واحد',
      1 => 'مكعبين',
      2 => '3 مكعبات',
    ),
    'qty_labels_he' => 
    array (
      0 => 'קובייה אחת',
      1 => 'שתי קוביות',
      2 => '3 קוביות',
    ),
    'qty_labels_en' => 
    array (
      0 => '',
      1 => '',
      2 => '',
    ),
    'shape' => 'rectangle',
    'designer_type' => 'none',
    'is_active' => true,
    'track_stock' => false,
    'stock_quantity' => 0,
    'sort_order' => 10,
    'spec_fields' => 
    array (
    ),
    'category_key' => 'sign_m',
  ),
  11 => 
  array (
    'name' => 'تقويم خشبي (صناعة يدوية)',
    'name_he' => 'לוח שנה מעץ (עבודת יד)',
    'name_en' => NULL,
    'description' => NULL,
    'description_he' => NULL,
    'description_en' => NULL,
    'icon' => NULL,
    'image' => NULL,
    'images' => NULL,
    'video_url' => NULL,
    'video' => NULL,
    'badge' => NULL,
    'badge_he' => NULL,
    'badge_en' => NULL,
    'pricing_type' => 'fixed',
    'is_custom' => false,
    'show_ref_images' => false,
    'price' => 350.0,
    'wholesale_price' => NULL,
    'compare_price' => NULL,
    'min_price' => NULL,
    'show_min_price' => false,
    'preset_sizes' => NULL,
    'compare_prices' => NULL,
    'size_prices' => NULL,
    'max_size' => NULL,
    'fixed_size_label' => NULL,
    'qty_labels' => NULL,
    'qty_labels_he' => NULL,
    'qty_labels_en' => NULL,
    'shape' => 'rectangle',
    'designer_type' => 'none',
    'is_active' => true,
    'track_stock' => false,
    'stock_quantity' => 0,
    'sort_order' => 0,
    'spec_fields' => 
    array (
    ),
    'category_key' => 'kashab',
  ),
);
        foreach ($products as $prod) {
            $specFields = $prod['spec_fields'];
            unset($prod['spec_fields']);
            $catKey = $prod['category_key'];
            unset($prod['category_key']);
            $prod['category_id'] = $categoryIds[$catKey] ?? null;
            $product = Product::updateOrCreate(['name' => $prod['name']], $prod);
            $product->specFields()->delete();
            foreach ($specFields as $field) {
                $product->specFields()->create($field);
            }
        }

        $heroSlides = array (
  0 => 
  array (
    'image' => NULL,
    'title' => 'قارمات مضيئة بتصميمك أنت',
    'title_he' => 'שלטים מוארים בעיצוב שלך',
    'title_en' => NULL,
    'subtitle' => 'صمّم لوحتك بالشكل والحجم اللي بدك ياه واطلبها أونلاين',
    'subtitle_he' => 'עצב את השלט שלך בצורה ובגודל שאתה רוצה והזמן אונליין',
    'subtitle_en' => NULL,
    'cta_text' => 'تصفح المنتجات',
    'cta_text_he' => 'עיין במוצרים',
    'cta_text_en' => NULL,
    'cta_link' => NULL,
    'sort_order' => 0,
    'is_active' => true,
  ),
  1 => 
  array (
    'image' => NULL,
    'title' => 'توصيل لجميع مناطق فلسطين',
    'title_he' => 'משלוחים לכל אזורי פלסטין',
    'title_en' => NULL,
    'subtitle' => 'من رام الله للخليل ونابلس وكل المدن والقرى — خلال أيام قليلة',
    'subtitle_he' => 'מרמאללה לחברון, שכם וכל הערים והכפרים — תוך ימים ספורים',
    'subtitle_en' => NULL,
    'cta_text' => 'اطلب الآن',
    'cta_text_he' => 'הזמן עכשיו',
    'cta_text_en' => NULL,
    'cta_link' => NULL,
    'sort_order' => 1,
    'is_active' => true,
  ),
  2 => 
  array (
    'image' => NULL,
    'title' => 'جودة تدوم لسنوات',
    'title_he' => 'איכות שנשארת לאורך שנים',
    'title_en' => NULL,
    'subtitle' => 'كفالة كاملة على كل منتجاتنا ضد عيوب التصنيع',
    'subtitle_he' => 'אחריות מלאה על כל המוצרים שלנו נגד פגמי ייצור',
    'subtitle_en' => NULL,
    'cta_text' => 'شوف الكفالة',
    'cta_text_he' => 'צפה באחריות',
    'cta_text_en' => NULL,
    'cta_link' => NULL,
    'sort_order' => 2,
    'is_active' => true,
  ),
);
        foreach ($heroSlides as $slide) {
            HeroSlide::updateOrCreate(['title' => $slide['title']], $slide);
        }

        $portfolio = array (
);
        foreach ($portfolio as $item) {
            PortfolioProject::updateOrCreate(['title' => $item['title']], $item);
        }

        $testimonials = array (
);
        foreach ($testimonials as $item) {
            Testimonial::updateOrCreate(['customer_name' => $item['customer_name'], 'text' => $item['text']], $item);
        }
    }
}
