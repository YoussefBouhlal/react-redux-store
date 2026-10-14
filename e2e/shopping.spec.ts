import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { fileURLToPath } from 'node:url';
import { firstProduct, products } from '../src/test/fixtures';

test.beforeEach(async ({ page }) => {
    await page.route(
        /^https:\/\/fakestoreapi\.com\/products(?:\/\d+)?$/,
        async (route) => {
            expect(route.request().method()).toBe('GET');
            const id = Number(
                new URL(route.request().url()).pathname.split('/')[2],
            );
            await route.fulfill({
                json: id
                    ? (products.find((product) => product.id === id) ?? null)
                    : products,
            });
        },
    );
    await page.route('https://fakestoreapi.com/img/**', async (route) => {
        const name =
            route.request().url() === firstProduct.image
                ? 'backpack.png'
                : 'shirt.png';
        await route.fulfill({
            path: fileURLToPath(new URL(`./assets/${name}`, import.meta.url)),
            contentType: 'image/png',
        });
    });
});

async function checkAccessibility(page: Page) {
    const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
    expect(results.violations).toEqual([]);
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
    ).toBe(true);
}

test('browse, add, persist, adjust and complete a simulated checkout', async ({
    page,
}) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('./#/');
    await expect(
        page.getByRole('link', { name: new RegExp(firstProduct.title) }),
    ).toBeVisible();
    await checkAccessibility(page);
    await page.getByLabel('Search products').fill('backpack');
    await expect(page).toHaveURL(/q=backpack/);
    await page
        .getByRole('link', { name: new RegExp(firstProduct.title) })
        .click();
    await expect(
        page.getByRole('heading', { name: firstProduct.title }),
    ).toBeVisible();
    await checkAccessibility(page);
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('link', { name: 'View cart' }).click();
    await page.reload();
    await expect(
        page.getByRole('spinbutton', {
            name: `Quantity for ${firstProduct.title}`,
        }),
    ).toHaveValue('1');
    await page
        .getByRole('button', {
            name: `Increase quantity for ${firstProduct.title}`,
        })
        .click();
    await expect(page.getByRole('spinbutton')).toHaveValue('2');
    await checkAccessibility(page);
    await page.getByRole('link', { name: 'Checkout', exact: true }).click();
    await page.getByRole('button', { name: 'Place demo order' }).click();
    await expect(page.getByLabel('Full name')).toBeFocused();
    await checkAccessibility(page);
    await page.getByLabel('Full name').fill('Portfolio Reviewer');
    await page.getByLabel('Email address').fill('reviewer@example.com');
    await page.getByLabel('Street address').fill('123 Example Street');
    await page.getByLabel('City', { exact: true }).fill('Example City');
    await page.getByLabel('Postal code').fill('10001');
    await page.getByRole('button', { name: 'Place demo order' }).click();
    await expect(
        page.getByRole('heading', { name: 'Demo order complete' }),
    ).toBeVisible();
    await checkAccessibility(page);
    const persisted = await page.evaluate(() => JSON.stringify(localStorage));
    expect(persisted).not.toContain('reviewer@example.com');
    expect(persisted).not.toContain('Example Street');
    await page.reload();
    await expect(
        page.getByRole('heading', { name: 'No demo order to display' }),
    ).toBeVisible();
    expect(errors).toEqual([]);
});

test('failed requests can be retried and missing routes recover', async ({
    page,
}) => {
    let failing = true;
    await page.route('https://fakestoreapi.com/products', (route) =>
        failing
            ? route.fulfill({ status: 503, body: '' })
            : route.fulfill({ json: products }),
    );
    await page.goto('./#/');
    await expect(page.getByRole('alert')).toContainText(
        'Unable to load products',
    );
    failing = false;
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(
        page.getByRole('link', { name: new RegExp(firstProduct.title) }),
    ).toBeVisible();
    await page.goto('./#/product/1');
    await page.reload();
    await expect(
        page.getByRole('heading', { name: firstProduct.title }),
    ).toBeVisible();
    await page.goto('./#/product/999');
    await expect(
        page.getByRole('heading', { name: 'Product not found' }),
    ).toBeVisible();
    await page.goto('./#/unknown');
    await expect(
        page.getByRole('heading', { name: 'Page not found' }),
    ).toBeVisible();
    await checkAccessibility(page);
});

test('responsive catalog, actual image rendering and keyboard entry', async ({
    page,
}) => {
    await page.goto('./#/');
    await expect(
        page.getByRole('link', { name: new RegExp(firstProduct.title) }),
    ).toBeVisible();
    const image = page.getByRole('img', { name: firstProduct.title });
    await expect(image).toBeVisible();
    const frame = await page.locator('.product-image').first().boundingBox();
    expect(frame).not.toBeNull();
    expect(Math.abs(frame!.width - frame!.height)).toBeLessThanOrEqual(1);
    const imageBounds = await image.boundingBox();
    expect(imageBounds).not.toBeNull();
    expect(imageBounds!.y + imageBounds!.height).toBeLessThanOrEqual(
        frame!.y + frame!.height,
    );
    expect(imageBounds!.x + imageBounds!.width).toBeLessThanOrEqual(
        frame!.x + frame!.width,
    );
    await expect
        .poll(() =>
            image.evaluate(
                (element) => (element as HTMLImageElement).naturalWidth,
            ),
        )
        .toBeGreaterThan(0);
    expect(new URL(page.url()).pathname).toBe('/react-redux-store/');
    const scriptPaths = await page
        .locator('script[src]')
        .evaluateAll((scripts) =>
            scripts.map(
                (script) => new URL((script as HTMLScriptElement).src).pathname,
            ),
        );
    expect(scriptPaths.length).toBeGreaterThan(0);
    expect(
        scriptPaths.every((path) =>
            path.startsWith('/react-redux-store/assets/'),
        ),
    ).toBe(true);
    const initialUrl = page.url();
    await page.keyboard.press('Tab');
    await expect(
        page.getByRole('link', { name: 'Skip to content' }),
    ).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    await expect(page).toHaveURL(initialUrl);
    const labels = await new AxeBuilder({ page })
        .withRules(['label-content-name-mismatch'])
        .analyze();
    expect(labels.violations).toEqual([]);
    await checkAccessibility(page);
    await page.goto('./#/product/1');
    await expect(
        page.getByRole('heading', { name: firstProduct.title }),
    ).toBeVisible();
    const productUrl = page.url();
    await page.getByRole('link', { name: 'Skip to content' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    await expect(page).toHaveURL(productUrl);
    await expect(
        page.getByRole('heading', { name: firstProduct.title }),
    ).toBeVisible();
});
