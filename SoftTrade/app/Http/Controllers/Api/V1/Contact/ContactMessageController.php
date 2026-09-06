<?php

namespace App\Http\Controllers\Api\V1\Contact;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    use ApiResponse;

    /** POST /api/v1/contact — public iletişim formu */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|email|max:160',
            'phone' => 'nullable|string|max:40',
            'subject' => 'required|string|max:180',
            'message' => 'required|string|max:5000',
        ]);

        $message = ContactMessage::create([
            ...$data,
            'status' => 'new',
        ]);

        return $this->created([
            'id' => $message->id,
            'status' => $message->status,
        ], 'Mesajınız alındı.');
    }

    /** GET /api/v1/admin/contact-messages */
    public function adminIndex(Request $request): JsonResponse
    {
        $messages = ContactMessage::query()
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate((int) $request->get('per_page', 50));

        return $this->success($messages->items(), meta: [
            'current_page' => $messages->currentPage(),
            'last_page' => $messages->lastPage(),
            'total' => $messages->total(),
        ]);
    }

    /** PUT /api/v1/admin/contact-messages/{id} */
    public function adminUpdate(Request $request, ContactMessage $contactMessage): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:new,read,resolved',
        ]);

        $contactMessage->update($data);

        return $this->success($contactMessage, 'Mesaj durumu güncellendi.');
    }
}
