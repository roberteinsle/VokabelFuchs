<?php

namespace Tests\Unit;

use App\Services\LevenshteinService;
use Tests\TestCase;

class LevenshteinServiceTest extends TestCase
{
    private LevenshteinService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new LevenshteinService();
    }

    public function test_exact_match_is_acceptable(): void
    {
        $this->assertTrue($this->service->isAcceptable('apple', 'apple'));
    }

    public function test_short_word_requires_exact_match(): void
    {
        // Words ≤3 chars require exact match
        $this->assertFalse($this->service->isAcceptable('ca', 'cat'));
        $this->assertTrue($this->service->isAcceptable('cat', 'cat'));
    }

    public function test_typo_within_tolerance_is_acceptable(): void
    {
        // "applr" vs "apple" → distance 1, tolerance = floor(5*0.2) = 1
        $this->assertTrue($this->service->isAcceptable('applr', 'apple'));
    }

    public function test_two_char_typo_on_long_word_is_not_acceptable(): void
    {
        // "computer" = 8 chars → tolerance = floor(8*0.2) = 1
        // "xompxter" vs "computer" → 2 substitutions → NOT ok
        $this->assertFalse($this->service->isAcceptable('xompxter', 'computer'));
        // "computr" vs "computer" → 1 deletion → ok
        $this->assertTrue($this->service->isAcceptable('computr', 'computer'));
    }

    public function test_case_insensitive_matching(): void
    {
        $this->assertTrue($this->service->isAcceptable('Apple', 'apple'));
        $this->assertTrue($this->service->isAcceptable('APPLE', 'apple'));
    }

    public function test_leading_trailing_whitespace_ignored(): void
    {
        $this->assertTrue($this->service->isAcceptable(' apple ', 'apple'));
    }

    public function test_completely_wrong_answer_is_not_acceptable(): void
    {
        $this->assertFalse($this->service->isAcceptable('banana', 'apple'));
    }
}
