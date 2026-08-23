<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\HeroSlide;
use App\Models\PortfolioProject;
use App\Models\Product;
use App\Models\ProductSpecField;
use App\Models\SpecTemplateField;
use App\Models\Testimonial;
use App\Services\TranslationService;
use Illuminate\Console\Command;

/**
 * One-time (re-runnable) sweep that fills in he/en translations for every
 * product, category, hero slide, spec field, portfolio project, and
 * testimonial that was created or edited before the auto-translation
 * feature existed — those rows never had a save() pass through the
 * translator, so their he/en columns stay empty (or, for older rows, hold
 * whatever was typed manually) until this runs. Safe to run again anytime;
 * it always re-derives he/en from the current Arabic text.
 */
class BackfillTranslations extends Command
{
    protected $signature = 'translate:backfill';
    protected $description = 'Auto-translate existing products, categories, hero slides, spec fields, portfolio projects, and testimonials from Arabic to Hebrew/English';

    public function handle(TranslationService $translator): int
    {
        $this->info('Translating categories...');
        Category::all()->each(function (Category $c) use ($translator) {
            $c->name_he = $translator->translate($c->name, 'he');
            $c->name_en = $translator->translate($c->name, 'en');
            $c->save();
            $this->line("  - #{$c->id} {$c->name}");
        });

        $this->info('Translating hero slides...');
        HeroSlide::all()->each(function (HeroSlide $s) use ($translator) {
            $s->title_he = $translator->translate($s->title, 'he');
            $s->title_en = $translator->translate($s->title, 'en');
            $s->subtitle_he = $translator->translate($s->subtitle, 'he');
            $s->subtitle_en = $translator->translate($s->subtitle, 'en');
            $s->cta_text_he = $translator->translate($s->cta_text, 'he');
            $s->cta_text_en = $translator->translate($s->cta_text, 'en');
            $s->save();
            $this->line("  - #{$s->id} {$s->title}");
        });

        $this->info('Translating products...');
        Product::all()->each(function (Product $p) use ($translator) {
            $p->name_he = $translator->translate($p->name, 'he');
            $p->name_en = $translator->translate($p->name, 'en');
            $p->description_he = $translator->translate($p->description, 'he');
            $p->description_en = $translator->translate($p->description, 'en');
            $p->badge_he = $translator->translate($p->badge, 'he');
            $p->badge_en = $translator->translate($p->badge, 'en');
            $p->qty_labels_he = $translator->translateArray($p->qty_labels, 'he');
            $p->qty_labels_en = $translator->translateArray($p->qty_labels, 'en');
            $p->save();
            $this->line("  - #{$p->id} {$p->name}");
        });

        $this->info('Translating product spec fields...');
        ProductSpecField::all()->each(function (ProductSpecField $f) use ($translator) {
            $f->label_he = $translator->translate($f->label, 'he');
            $f->label_en = $translator->translate($f->label, 'en');
            $f->options_he = $translator->translateArray($f->options, 'he');
            $f->options_en = $translator->translateArray($f->options, 'en');
            $f->save();
        });

        $this->info('Translating spec template fields...');
        SpecTemplateField::all()->each(function (SpecTemplateField $f) use ($translator) {
            $f->label_he = $translator->translate($f->label, 'he');
            $f->label_en = $translator->translate($f->label, 'en');
            $f->options_he = $translator->translateArray($f->options, 'he');
            $f->options_en = $translator->translateArray($f->options, 'en');
            $f->save();
        });

        $this->info('Translating portfolio projects...');
        PortfolioProject::all()->each(function (PortfolioProject $p) use ($translator) {
            $p->title_he = $translator->translate($p->title, 'he');
            $p->title_en = $translator->translate($p->title, 'en');
            $p->description_he = $translator->translate($p->description, 'he');
            $p->description_en = $translator->translate($p->description, 'en');
            $p->save();
        });

        $this->info('Translating testimonials...');
        Testimonial::all()->each(function (Testimonial $t) use ($translator) {
            $t->text_he = $translator->translate($t->text, 'he');
            $t->text_en = $translator->translate($t->text, 'en');
            $t->save();
        });

        $this->info('Done.');

        return self::SUCCESS;
    }
}
