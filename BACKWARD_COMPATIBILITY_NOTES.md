# Backward Compatibility Implementation

## Overview
The dual currency system now includes full backward compatibility with the old `price` field. This allows the system to work seamlessly with existing services that only have the old `price` field.

## Implementation Details

### Database Schema
The Service model now has **three** price fields:
- `price` - Old field for backward compatibility (BGN in лева)
- `priceEUR` - New EUR price field
- `priceBGN` - New BGN price field

All three fields are **optional** to allow backward compatibility.

### Backend Logic

**When creating a service:**
1. If `priceEUR` AND `priceBGN` are provided → Use both as-is
2. If only `priceEUR` is provided → Calculate `priceBGN = priceEUR * 1.95583`
3. If only `priceBGN` is provided → Calculate `priceEUR = priceBGN / 1.95583`
4. If only old `price` is provided → 
   - Set `priceBGN = price` (old price is in BGN)
   - Calculate `priceEUR = price / 1.95583`
5. Store all three fields for maximum compatibility

**When updating a service:**
- Accepts all three fields
- Conversion logic applies when only one currency is provided
- Old `price` field is preserved for backward compatibility

### Frontend Display Logic

All components use the following fallback priority:
1. `priceBGN` (new field) → If missing, use `price` (old field)
2. `priceEUR` (new field) → If missing, calculate from `price / 1.95583`

**Display format:**
- Primary: Large, golden, bold → BGN amount
- Secondary: Small, gray → EUR amount

### Conversion Rate
- **1 EUR = 1.95583 BGN** (official pegged Bulgarian Lev rate)

## Migration Path

### Existing Services
Existing services with only the old `price` field will:
1. Continue to work without any changes
2. Display prices correctly on frontend (BGN from `price`, EUR calculated)
3. When edited in admin, get migrated to dual pricing

### New Services
Admin must enter both EUR and BGN prices manually when creating new services.

## Testing

### Test Cases
1. ✅ Service with only old `price` field → Display correctly
2. ✅ Service with only `priceBGN` → Display + calculate EUR
3. ✅ Service with only `priceEUR` → Display + calculate BGN
4. ✅ Service with both `priceEUR` and `priceBGN` → Display both
5. ✅ Edit existing service with old `price` → Migrate to dual pricing
6. ✅ Create new service → Requires both prices

## Notes
- The old `price` field is assumed to be in BGN (лв.)
- The system converts automatically when needed
- No manual migration script is required - services work as-is
- Admins can gradually update services to use the new dual pricing

