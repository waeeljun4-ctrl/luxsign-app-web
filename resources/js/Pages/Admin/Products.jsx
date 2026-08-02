import { useState, useRef, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Button, PricingLabel } from '../../Components/UI';
import { useConfirm } from '../../Components/useConfirm';
import axios from 'axios';

export default function Products({ products, categories }) {
    const [list, setList] = useState(products);
    const { delete: destroy } = useForm();
    const { confirmAction, dialog } = useConfirm();
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    // `list` only seeds from `products` on first render — without this,
    // deleting/reordering leaves the old array in place until a full
    // page reload re-mounts the component, even though Inertia already
    // sent back fresh props.
    useEffect(() => { setList(products); }, [products]);

    function handleDelete(product) {
        confirmAction(`هل تريد حذف "${product.name}"؟`,
            (cb) => destroy(route('admin.products.destroy', product.id), cb));
    }

    function handleDragStart(index) { dragItem.current = index; }
    function handleDragEnter(index) { dragOverItem.current = index; }

    function handleDrop() {
        const newList = [...list];
        const draggedItem = newList.splice(dragItem.current, 1)[0];
        newList.splice(dragOverItem.current, 0, draggedItem);
        setList(newList);
        axios.post(route('admin.products.reorder'), { order: newList.map(p => p.id) });
    }

    return (
        <>
            <Head title="المنتجات — الإدارة" />
            {dialog}
            <AdminLayout title="📦 المنتجات">
                <div className="flex items-center justify-between mb-5">
                    <p className="text-muted text-sm">{list.length} منتج في المتجر — اسحب ⠿ لإعادة الترتيب</p>
                    <Link href={route('admin.products.create')}>
                        <Button variant="gold">+ إضافة منتج</Button>
                    </Link>
                </div>

                <div className="bg-white rounded-2xl border border-cream-3 overflow-hidden">
                    {list.length === 0 ? (
                        <div className="text-center py-16 text-muted">
                            <div className="text-4xl mb-3">📦</div>
                            <p className="text-sm">لا توجد منتجات بعد</p>
                        </div>
                    ) : list.map((p, i) => (
                        <div key={p.id}
                            draggable
                            onDragStart={() => handleDragStart(i)}
                            onDragEnter={() => handleDragEnter(i)}
                            onDragEnd={handleDrop}
                            onDragOver={e => e.preventDefault()}
                            className={`flex items-center gap-3 px-4 py-3.5 hover:bg-cream transition-colors cursor-move ${i < list.length - 1 ? 'border-b border-cream-3' : ''}`}>

                            <span className="text-muted shrink-0">⠿</span>

                            <div className="w-12 h-12 bg-cream-2 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-xl">
                                {p.image
                                    ? <img src={`/storage/${p.image}`} alt={p.name} className="w-full h-full object-cover" />
                                    : (p.icon || '📦')
                                }
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-bold text-sm text-ink">{p.name}</p>
                                    {!p.is_active && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">مخفي</span>}
                                    {p.badge && <span className="text-xs bg-gold-pale text-gold px-2 py-0.5 rounded-full">{p.badge}</span>}
                                    {p.video_url && <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">▶ فيديو</span>}
                                    {p.image && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">🖼 صورة</span>}
                                </div>
                                <p className="text-xs text-muted mt-0.5">{p.category?.name} · <PricingLabel type={p.pricing_type} /></p>
                            </div>

                            <div className="font-black text-gold text-sm shrink-0">
                                {p.pricing_type === 'sqm' ? `${p.price}₪/م²` : `${p.price}₪`}
                            </div>

                            <div className="flex gap-1.5 shrink-0">
                                <Link href={route('admin.products.edit', p.id)}
                                    className="bg-cream-2 border border-cream-3 text-ink text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gold-pale hover:border-gold hover:text-gold transition-colors">
                                    ✏️ تعديل
                                </Link>
                                <button onClick={() => handleDelete(p)}
                                    className="border border-cream-3 text-gray-400 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:text-red-500 hover:border-red-400 transition-colors">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </AdminLayout>
        </>
    );
}
