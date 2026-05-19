<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('login page can be rendered', function () {
    $this->get('/login')->assertStatus(200);
});

test('users can authenticate with valid credentials', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
});

test('users cannot authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('authenticated users can logout', function () {
    $user = $this->makeUserInWorkspace('admin');

    $this->actingAs($user)
        ->post('/logout')
        ->assertRedirect('/login');

    $this->assertGuest();
});
