# Database Reorganization Guide (PostgreSQL)

Bu duzenleme mevcut tablolari degistirmez. Sadece pgAdmin tarafinda daha okunabilir bir yapi icin moduler schema + view katmani ekler.

## Yeni schema yapisi
- `catalog`: urun/kategori/marka/varyant/yorum
- `customers`: kullanici/adres/sepet
- `sales`: siparis/kupon/siparis kalemleri
- `security`: token/rol/izin
- `operations`: queue ve failed job gorunumleri
- `readable`: genel rehber gorunumu

## Hemen kullanabilecegin view'lar
- `catalog.v_products`
- `catalog.v_product_variants`
- `customers.v_users`
- `customers.v_addresses`
- `sales.v_orders`
- `sales.v_order_items`
- `readable.v_schema_guide`

## pgAdmin hizli sorgular
```sql
SELECT * FROM readable.v_schema_guide;
SELECT * FROM catalog.v_products LIMIT 50;
SELECT * FROM sales.v_orders LIMIT 50;
SELECT * FROM customers.v_users LIMIT 50;
```

## Neden bu yapi
- Uygulama kodunu bozmadan, raporlama ve incelemeyi hizlandirir.
- Table isimlerini yeniden adlandirma riskini ortadan kaldirir.
- Ekipte herkes ayni mantikla (catalog/customers/sales) veriyi bulur.
