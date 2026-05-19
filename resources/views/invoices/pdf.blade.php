<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Счёт № {{ $invoice->number }}</title>
    <style>
        @page { margin: 40px; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #1f2937; }
        h1 { font-size: 22px; margin: 0 0 4px; }
        .muted { color: #6b7280; }
        .row { width: 100%; margin-bottom: 24px; }
        .row td { vertical-align: top; }
        table.items { width: 100%; border-collapse: collapse; margin-top: 12px; }
        table.items th, table.items td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        table.items th { background: #f3f4f6; }
        .text-right { text-align: right; }
        .totals { margin-top: 16px; float: right; width: 40%; }
        .totals td { padding: 4px 8px; }
        .totals tr.total td { border-top: 2px solid #1f2937; font-weight: bold; font-size: 13px; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 10px; }
        .badge-paid { background: #d1fae5; color: #065f46; }
        .badge-sent { background: #dbeafe; color: #1e40af; }
        .badge-draft { background: #e5e7eb; color: #374151; }
        .badge-overdue { background: #fee2e2; color: #991b1b; }
        .notes { clear: both; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #6b7280; }
    </style>
</head>
<body>
    <table class="row">
        <tr>
            <td style="width: 60%;">
                <h1>Счёт № {{ $invoice->number }}</h1>
                <div class="muted">Выставлен: {{ $invoice->issued_at->format('d.m.Y') }}</div>
                <div class="muted">Срок оплаты: {{ $invoice->due_at->format('d.m.Y') }}</div>
            </td>
            <td class="text-right">
                <div style="font-size: 16px; font-weight: bold;">{{ $appName }}</div>
                <span class="badge badge-{{ $invoice->status === 'paid' ? 'paid' : ($invoice->status === 'sent' ? 'sent' : ($invoice->status === 'overdue' ? 'overdue' : 'draft')) }}">
                    @switch($invoice->status)
                        @case('draft') Черновик @break
                        @case('sent') Отправлен @break
                        @case('partially_paid') Частично оплачен @break
                        @case('paid') Оплачен @break
                        @case('overdue') Просрочен @break
                    @endswitch
                </span>
            </td>
        </tr>
    </table>

    <table class="row">
        <tr>
            <td style="width: 50%;">
                <div class="muted">Кому:</div>
                <div style="font-weight: bold;">{{ $client->name }}</div>
                @if($client->company)<div>{{ $client->company }}</div>@endif
                @if($client->email)<div class="muted">{{ $client->email }}</div>@endif
                @if($client->phone)<div class="muted">{{ $client->phone }}</div>@endif
            </td>
        </tr>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th>Описание</th>
                <th class="text-right" style="width: 80px;">Кол-во</th>
                <th class="text-right" style="width: 120px;">Цена</th>
                <th class="text-right" style="width: 120px;">Сумма</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $item)
                <tr>
                    <td>{{ $item->description }}</td>
                    <td class="text-right">{{ rtrim(rtrim(number_format((float) $item->quantity, 2, '.', ''), '0'), '.') }}</td>
                    <td class="text-right">{{ number_format((float) $item->unit_price, 2, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format((float) $item->amount, 2, ',', ' ') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td class="muted">Подытог:</td>
            <td class="text-right">{{ number_format((float) $invoice->subtotal, 2, ',', ' ') }} {{ $invoice->currency }}</td>
        </tr>
        @if((float) $invoice->discount > 0)
            <tr>
                <td class="muted">Скидка:</td>
                <td class="text-right">−{{ number_format((float) $invoice->discount, 2, ',', ' ') }} {{ $invoice->currency }}</td>
            </tr>
        @endif
        @if((float) $invoice->tax_rate > 0)
            <tr>
                <td class="muted">Налог ({{ (float) $invoice->tax_rate }}%):</td>
                <td class="text-right">{{ number_format((float) $invoice->tax_amount, 2, ',', ' ') }} {{ $invoice->currency }}</td>
            </tr>
        @endif
        <tr class="total">
            <td>Итого:</td>
            <td class="text-right">{{ number_format((float) $invoice->total, 2, ',', ' ') }} {{ $invoice->currency }}</td>
        </tr>
    </table>

    @if($invoice->notes)
        <div class="notes">
            <strong>Примечание:</strong><br>
            {!! nl2br(e($invoice->notes)) !!}
        </div>
    @endif
</body>
</html>
