<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::updateOrCreate(
            ['email' => 'admin@luxsign.ps'],
            ['name' => 'LuxSign Admin', 'password' => Hash::make('admin123'), 'role' => 'admin']
        );

        // Categories
        $cats = [
            ['name' => 'قارمات مضيئة',   'icon' => '🔆', 'key' => 'sign_q',  'sort_order' => 1],
            ['name' => 'أحرف ديكور',      'icon' => '🔤', 'key' => 'sign_h',  'sort_order' => 2],
            ['name' => 'لوحات CNC',        'icon' => '⚙️', 'key' => 'sign_c',  'sort_order' => 3],
            ['name' => 'مضيء متحرك',      'icon' => '✨', 'key' => 'sign_m',  'sort_order' => 4],
            ['name' => 'ديكور إسلامي',    'icon' => '🕌', 'key' => 'islam',   'sort_order' => 5],
            ['name' => 'لوحات سيارات',    'icon' => '🚗', 'key' => 'car',     'sort_order' => 6],
            ['name' => 'مصمم النمر',       'icon' => '🔢', 'key' => 'plate',   'sort_order' => 7],
            ['name' => 'تصاميم مخصصة',   'icon' => '✏️', 'key' => 'custom',  'sort_order' => 8],
        ];

        foreach ($cats as $cat) {
            Category::updateOrCreate(['key' => $cat['key']], $cat);
        }

        $q = Category::where('key', 'sign_q')->first()->id;
        $h = Category::where('key', 'sign_h')->first()->id;
        $c = Category::where('key', 'sign_c')->first()->id;
        $m = Category::where('key', 'sign_m')->first()->id;
        $i = Category::where('key', 'islam')->first()->id;
        $car = Category::where('key', 'car')->first()->id;
        $plate = Category::where('key', 'plate')->first()->id;
        $custom = Category::where('key', 'custom')->first()->id;

        // Products
        $products = [
            // قارمات مضيئة
            ['category_id'=>$q,'name'=>'قارمة دائرية LED','description'=>'أحجام 60/70/80/100 سم — إضاءة LED مخصصة','icon'=>'🔆','badge'=>'الأكثر طلباً','pricing_type'=>'sqm','price'=>750,'preset_sizes'=>[60,70,80,100],'designer_type'=>'sign','sort_order'=>1],
            ['category_id'=>$q,'name'=>'قارمة مزدوجة الجهتين','description'=>'مرئية من الجهتين — 60/70/80/100 سم','icon'=>'💡','badge'=>'','pricing_type'=>'sqm','price'=>750,'preset_sizes'=>[60,70,80,100],'designer_type'=>'sign','sort_order'=>2],
            ['category_id'=>$q,'name'=>'قارمة مستطيلة مضيئة','description'=>'شكل مستطيل — مناسب للمحلات الكبيرة','icon'=>'🟨','badge'=>'','pricing_type'=>'sqm','price'=>750,'preset_sizes'=>[],'designer_type'=>'sign','sort_order'=>3],
            // أحرف ديكور
            ['category_id'=>$h,'name'=>'أحرف مضيئة ذهبية','description'=>'أحرف بالحجم والشكل حسب طلبك — تركيب احترافي','icon'=>'🔤','badge'=>'','pricing_type'=>'sqm','price'=>750,'preset_sizes'=>[],'designer_type'=>'sign','sort_order'=>1],
            ['category_id'=>$h,'name'=>'أحرف سمك ٣ سم','description'=>'أحرف مضيئة بسمك ٣ سانتي — جودة فاخرة','icon'=>'🌟','badge'=>'','pricing_type'=>'sqm','price'=>750,'preset_sizes'=>[],'designer_type'=>'sign','sort_order'=>2],
            // لوحات CNC
            ['category_id'=>$c,'name'=>'لوحة CNC اقتصادية','description'=>'تفصيل حسب الطلب لتسويق محلك','icon'=>'⚙️','badge'=>'اقتصادي','pricing_type'=>'sqm','price'=>750,'preset_sizes'=>[],'designer_type'=>'sign','sort_order'=>1],
            // مضيء متحرك
            ['category_id'=>$m,'name'=>'لوحة مضيئة متحركة','description'=>'إضاءة LED متحركة تجذب الأنظار','icon'=>'✨','badge'=>'','pricing_type'=>'fixed','price'=>200,'preset_sizes'=>[],'designer_type'=>'sign','sort_order'=>1],
            // ديكور إسلامي
            ['category_id'=>$i,'name'=>'لوحة آية قرآنية','description'=>'خط عربي احترافي على خلفية مؤطرة','icon'=>'🕌','badge'=>'الأكثر طلباً','pricing_type'=>'sqm','price'=>750,'preset_sizes'=>[],'designer_type'=>'sign','sort_order'=>1],
            ['category_id'=>$i,'name'=>'نافذة إسلامية مضيئة','description'=>'شكل نافذة تراثية CNC بإضاءة دافئة','icon'=>'🌟','badge'=>'جديد','pricing_type'=>'sqm','price'=>750,'preset_sizes'=>[],'designer_type'=>'sign','sort_order'=>2],
            // لوحات سيارات
            ['category_id'=>$car,'name'=>'لوحة سيارة مخصصة','description'=>'رقم سيارتك بخلفية وألوان حسب طلبك','icon'=>'🚗','badge'=>'الأكثر طلباً','pricing_type'=>'fixed','price'=>140,'preset_sizes'=>[],'designer_type'=>'plate','sort_order'=>1],
            // مصمم النمر
            ['category_id'=>$plate,'name'=>'نمر جوز','description'=>'نمرتين بتصميمك — 52×11 سم','icon'=>'🔢','badge'=>'عرض','pricing_type'=>'plate_pair','price'=>150,'preset_sizes'=>[],'designer_type'=>'plate','sort_order'=>1],
            ['category_id'=>$plate,'name'=>'نمرة مفردة','description'=>'نمرة واحدة بتصميمك الخاص','icon'=>'🔢','badge'=>'','pricing_type'=>'plate_single','price'=>100,'preset_sizes'=>[],'designer_type'=>'plate','sort_order'=>2],
            // تصاميم مخصصة
            ['category_id'=>$custom,'name'=>'تصميم مخصص كامل','description'=>'تصميم حسب طلبك من الصفر','icon'=>'🎨','badge'=>'مخصص','pricing_type'=>'fixed','price'=>100,'preset_sizes'=>[],'designer_type'=>'sign','sort_order'=>1],
        ];

        foreach ($products as $prod) {
            Product::create($prod);
        }
    }
}
