<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductCustomMeasurementRuleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'min_width' => $this->min_width !== null ? (float) $this->min_width : null,
            'max_width' => $this->max_width !== null ? (float) $this->max_width : null,
            'step_width' => $this->step_width !== null ? (float) $this->step_width : null,
            'min_height' => $this->min_height !== null ? (float) $this->min_height : null,
            'max_height' => $this->max_height !== null ? (float) $this->max_height : null,
            'step_height' => $this->step_height !== null ? (float) $this->step_height : null,
            'formula_type' => $this->formula_type,
            'unit_price' => $this->unit_price !== null ? (float) $this->unit_price : null,
            'base_price' => $this->base_price !== null ? (float) $this->base_price : null,
            'min_billable_area' => $this->min_billable_area !== null ? (float) $this->min_billable_area : null,
            'min_total_price' => $this->min_total_price !== null ? (float) $this->min_total_price : null,
            'allow_decimal' => (bool) $this->allow_decimal,
        ];
    }
}
