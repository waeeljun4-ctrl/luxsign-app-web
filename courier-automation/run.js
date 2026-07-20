const { chromium } = require('playwright');
const fs = require('fs');

async function fillTextField(page, field) {
    if (!field?.selector || field.value === undefined || field.value === null || field.value === '') return;
    await page.fill(field.selector, String(field.value));
}

async function fillAutocompleteField(page, field) {
    if (!field?.selector || !field.value) return;
    await page.fill(field.selector, String(field.value));
    // Angular autocomplete panels render options a moment after typing — wait, then pick the first suggestion.
    await page.waitForTimeout(800);
    const option = page.locator('.mat-autocomplete-panel .mat-option, .cdk-overlay-pane [role="option"]').first();
    if (await option.count().catch(() => 0)) {
        await option.click().catch(() => {});
    }
}

async function applyFixedSelections(page, fixedSelections) {
    for (const sel of fixedSelections || []) {
        try {
            await page.selectOption(sel.selector, { label: sel.value });
            continue;
        } catch {
            // Not a native <select> — Angular custom dropdown: click to open, click the option text.
        }
        await page.click(sel.selector);
        await page.waitForTimeout(300);
        await page.getByText(sel.value, { exact: true }).first().click();
    }
}

async function fillFields(page, fields) {
    for (const [key, field] of Object.entries(fields || {})) {
        if (!field?.value) continue;
        if (field.type === 'autocomplete') {
            await fillAutocompleteField(page, field);
        } else {
            await fillTextField(page, field);
        }
    }
}

function buildFieldValues(fieldMap, order) {
    const map = fieldMap.fields || {};
    const values = {};
    const orderValueFor = {
        recipient_name: order.customer_name,
        phone: order.customer_phone,
        address: order.address,
        address_area: order.address,
        cod_amount: order.total,
        notes: order.notes,
        order_ref: order.ref,
    };
    for (const key of Object.keys(map)) {
        values[key] = { ...map[key], value: orderValueFor[key] ?? map[key].fixed_value ?? null };
    }
    return values;
}

async function main() {
    const inputPath = process.argv[2];
    if (!inputPath) {
        console.log(JSON.stringify({ success: false, error: 'NO_INPUT_PATH' }));
        process.exit(1);
    }

    const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    const { company, orders } = input;
    const fm = company.field_map || {};

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const results = [];

    try {
        await page.goto(company.login_url, { waitUntil: 'networkidle', timeout: 30000 });
        if (fm.login?.open_trigger_selector) {
            await page.click(fm.login.open_trigger_selector);
            await page.waitForTimeout(1000);
        }
        await page.fill(fm.login?.username_selector, company.username);
        await page.fill(fm.login?.password_selector, company.password);
        await page.click(fm.login?.submit_selector);
        await page.waitForLoadState('networkidle', { timeout: 30000 });

        for (const order of orders) {
            try {
                // The "add shipment" form is a modal, not a separate page — open it via its trigger button each time.
                if (fm.add_shipment_trigger_selector) {
                    await page.click(fm.add_shipment_trigger_selector);
                    await page.waitForTimeout(1000);
                } else if (company.add_shipment_url) {
                    await page.goto(company.add_shipment_url, { waitUntil: 'networkidle', timeout: 30000 });
                }

                await fillFields(page, buildFieldValues(fm, order));
                await applyFixedSelections(page, fm.fixed_selections);

                await page.click(fm.submit_selector);
                await page.waitForTimeout(2000);

                results.push({ ref: order.ref, success: true });
            } catch (e) {
                results.push({ ref: order.ref, success: false, error: e.message });
            }
        }
    } catch (e) {
        console.log(JSON.stringify({ success: false, error: 'LOGIN_OR_SETUP_FAILED: ' + e.message, results }));
        await browser.close();
        process.exit(1);
    }

    await browser.close();
    console.log(JSON.stringify({ success: true, results }));
}

main();
