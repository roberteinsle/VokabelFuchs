<?php

namespace App\Console\Commands;

use App\Models\Child;
use App\Services\LeitnerService;
use Illuminate\Console\Command;

class BackfillFlashCards extends Command
{
    protected $signature = 'leitner:backfill-cards';
    protected $description = 'Create missing free_text and dictation flash cards for all existing children';

    public function __construct(private LeitnerService $leitner)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $children = Child::with('parent')->get();
        $total = 0;

        foreach ($children as $child) {
            $created = $this->leitner->createMissingCards($child->id, $child->parent_id);
            if ($created > 0) {
                $this->line("  {$child->name}: +{$created} Karten");
                $total += $created;
            }
        }

        $this->info("Fertig: {$total} Karten erstellt.");
        return Command::SUCCESS;
    }
}
