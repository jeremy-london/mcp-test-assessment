# Examples

Sample inputs for each tool. Start the UI with `npm run ui`, select a tool, and click an example chip to fill the JSON arguments. You can also paste any JSON from here.

These are normal, valid inputs. Find the edge cases yourself.

## echo

**Hello**

```json
{
  "message": "hello"
}
```

**Unicode**

```json
{
  "message": "café ✓ 日本語"
}
```

**Empty string**

```json
{
  "message": ""
}
```

## add_numbers

**Small list**

```json
{
  "numbers": [
    1,
    2,
    3
  ]
}
```

**Decimals**

```json
{
  "numbers": [
    0.1,
    0.2
  ]
}
```

**Negatives**

```json
{
  "numbers": [
    -5,
    10,
    -2
  ]
}
```

**Single value**

```json
{
  "numbers": [
    42
  ]
}
```

## get_book

**Dune**

```json
{
  "id": "b1"
}
```

**Hyperion**

```json
{
  "id": "b6"
}
```

## list_books

**First page**

```json
{
  "limit": 2,
  "offset": 0
}
```

**Second page**

```json
{
  "limit": 2,
  "offset": 2
}
```

**Default paging**

```json
{}
```

**Past the end**

```json
{
  "limit": 5,
  "offset": 5
}
```

## search_books

**Title word**

```json
{
  "query": "Dark"
}
```

**Lowercase**

```json
{
  "query": "snow"
}
```

**No match**

```json
{
  "query": "Zzyzx"
}
```

## create_book

**Valid book**

```json
{
  "title": "The Dispossessed",
  "author": "Ursula K. Le Guin",
  "year": 1974
}
```

**Oldest allowed year**

```json
{
  "title": "Old Manuscript",
  "author": "Anonymous",
  "year": 1450
}
```

**Missing author**

```json
{
  "title": "No Author",
  "year": 2000
}
```

## update_book

**Change year**

```json
{
  "id": "b2",
  "patch": {
    "year": 1985
  }
}
```

**Change title**

```json
{
  "id": "b4",
  "patch": {
    "title": "Foundation (Revised)"
  }
}
```

**Unknown book**

```json
{
  "id": "missing",
  "patch": {
    "year": 2000
  }
}
```

## delete_book

**Delete b6**

```json
{
  "id": "b6"
}
```

**Delete b5**

```json
{
  "id": "b5"
}
```

## get_exchange_rate

**USD to EUR**

```json
{
  "from": "USD",
  "to": "EUR"
}
```

**GBP to JPY**

```json
{
  "from": "GBP",
  "to": "JPY"
}
```

**Same currency**

```json
{
  "from": "EUR",
  "to": "EUR"
}
```

**Lowercase codes**

```json
{
  "from": "usd",
  "to": "gbp"
}
```

## wait_for_job

**Job that succeeds**

```json
{
  "jobId": "job-ok"
}
```

**Job that fails**

```json
{
  "jobId": "job-failed"
}
```
