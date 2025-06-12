# Деплой инструкции

## ✅ Cloudflare Pages развернуто

**URL**: https://e5a1cd26.cvety-admin-react.pages.dev
**Project Name**: cvety-admin-react

## 🔧 Настройка кастомного домена

Для добавления домена `admin.cvety.kz`:

1. Зайдите в [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Перейдите в **Pages** → **cvety-admin-react**
3. Вкладка **Custom domains** → **Set up a custom domain**
4. Добавьте домен: `admin.cvety.kz`
5. Cloudflare автоматически создаст CNAME запись

## 📝 DNS настройки

Если нужно настроить вручную:

```
Type: CNAME
Name: admin
Target: cvety-admin-react.pages.dev
```

## 🚀 Автоматический деплой

Для настройки автоматического деплоя при push в Git:

```bash
# Подключить к Git репозиторию
wrangler pages project connect cvety-admin-react
```

## 🔄 Обновление деплоя

```bash
# Пересобрать и задеплоить
npm run build
wrangler pages deploy dist --project-name cvety-admin-react
```

## 🌐 Текущие ссылки

- **Временная ссылка**: https://e5a1cd26.cvety-admin-react.pages.dev
- **Целевой домен**: admin.cvety.kz (настроить в Dashboard)
- **API Backend**: https://faq-demo.cvety.kz

## 📊 Статус

- ✅ Сборка успешна
- ✅ Деплой на Pages выполнен
- ⏳ Кастомный домен (требует настройки в Dashboard)
- ✅ API интеграция работает