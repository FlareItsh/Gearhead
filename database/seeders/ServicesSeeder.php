<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServicesSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $services = [

        ];

        $rows = [
            [1, 'Basic', 'body wash,vacuum, tire black, blow dry', 'Small', 'Basic', 50, 130, 'active'],
            [2, 'Basic', 'body wash,vacuum, tire black, blow dry', 'Medium', 'Basic', 50, 150, 'active'],
            [3, 'Basic', 'body wash,vacuum, tire black, blow dry', 'Large', 'Basic', 50, 200, 'active'],
            [4, 'Basic', 'body wash,vacuum, tire black, blow dry', 'X-Large', 'Basic', 50, 300, 'active'],
            [5, 'Basic', 'body wash,vacuum, tire black, blow dry', 'XX-Large', 'Basic', 50, 350, 'active'],
            [6, 'Underwash', 'body wash,vacuum,tire black,blow dry,underwash', 'Small', 'Underwash', 60, 310, 'active'],
            [7, 'Underwash', 'body wash,vacuum,tire black,blow dry,underwash', 'Medium', 'Underwash', 60, 340, 'active'],
            [8, 'Underwash', 'body wash,vacuum,tire black,blow dry,underwash', 'Large', 'Underwash', 60, 390, 'active'],
            [9, 'Underwash', 'body wash,vacuum,tire black,blow dry,underwash', 'X-Large', 'Underwash', 60, 500, 'active'],
            [10, 'Enginewash', 'body wash,vacuum,tire black,blow dry,engine wash', 'Small', 'Enginewash', 60, 280, 'active'],
            [11, 'Enginewash', 'body wash,vacuum,tire black,blow dry,engine wash', 'Medium', 'Enginewash', 60, 330, 'active'],
            [12, 'Enginewash', 'body wash,vacuum,tire black,blow dry,engine wash', 'Large', 'Enginewash', 60, 350, 'active'],
            [13, 'Enginewash', 'body wash,vacuum,tire black,blow dry,engine wash', 'X-Large', 'Enginewash', 60, 480, 'active'],
            [14, 'Enginewash', 'body wash,vacuum,tire black,blow dry,engine wash', 'XX-Large', 'Enginewash', 60, 520, 'active'],
            [15, 'Hand Wax', 'body wash,vacuum,tire black,blow dry,liquid hand wax', 'Small', 'Hand Wax', 50, 170, 'active'],
            [16, 'Hand Wax', 'body wash,vacuum,tire black,blow dry,liquid hand wax', 'Medium', 'Hand Wax', 50, 200, 'active'],
            [17, 'Hand Wax', 'body wash,vacuum,tire black,blow dry,liquid hand wax', 'Large', 'Hand Wax', 50, 260, 'active'],
            [18, 'Hand Wax', 'body wash,vacuum,tire black,blow dry,liquid hand wax', 'X-Large', 'Hand Wax', 50, 350, 'active'],
            [19, 'Armor All/All Purpose Dressing', 'Prevent plastic and vinyl from cracking. fading. disccoloration. and premature aging', 'Small', 'Additonal Services', 40, 60, 'active'],
        ];

        $rows = array_merge($rows, [
            [20, 'Armor All/All Purpose Dressing', 'Prevent plastic and vinyl from cracking. fading. disccoloration. and premature aging', 'Medium', 'Additonal Services', 40, 60, 'active'],
            [21, 'Armor All/All Purpose Dressing', 'Prevent plastic and vinyl from cracking. fading. disccoloration. and premature aging', 'Large', 'Additonal Services', 40, 70, 'active'],
            [22, 'Armor All/All Purpose Dressing', 'Prevent plastic and vinyl from cracking. fading. disccoloration. and premature aging', 'X-Large', 'Additonal Services', 40, 90, 'active'],
            [23, 'Watermarks Removal/Glass Detailing', 'Prevent plastic and vinyl from cracking. fading. disccoloration. and premature aging', 'Small', 'Additonal Services', 80, 900, 'active'],
            [24, 'Watermarks Removal/Glass Detailing', 'Prevent plastic and vinyl from cracking. fading. disccoloration. and premature aging', 'Medium', 'Additonal Services', 80, 1200, 'active'],
            [25, 'Watermarks Removal/Glass Detailing', 'Prevent plastic and vinyl from cracking. fading. disccoloration. and premature aging', 'Large', 'Additonal Services', 80, 1400, 'active'],
            [26, 'Watermarks Removal/Glass Detailing', 'Prevent plastic and vinyl from cracking. fading. disccoloration. and premature aging', 'X-Large', 'Additonal Services', 80, 1700, 'active'],
            [27, 'Hard Shell ', 'body wash,vacuum,tire black,blow dry,turtle wax', 'Small', 'Buff Wax', 50, 360, 'active'],
            [28, 'Hard Shell ', 'body wash,vacuum,tire black,blow dry,turtle wax', 'Medium', 'Buff Wax', 50, 430, 'active'],
            [29, 'Hard Shell ', 'body wash,vacuum,tire black,blow dry,turtle wax', 'Large', 'Buff Wax', 50, 520, 'active'],
            [30, 'Hard Shell ', 'body wash,vacuum,tire black,blow dry,turtle wax', 'X-Large', 'Buff Wax', 50, 700, 'active'],
            [31, 'Waterproof', 'body wash,vacuum,tire black,blow dry,botny wax', 'Small', 'Buff Wax', 50, 430, 'active'],
            [32, 'Waterproof', 'body wash,vacuum,tire black,blow dry,botny wax', 'Medium', 'Buff Wax', 50, 520, 'active'],
            [33, 'Waterproof', 'body wash,vacuum,tire black,blow dry,botny wax', 'Large', 'Buff Wax', 50, 660, 'active'],
            [34, 'Waterproof', 'body wash,vacuum,tire black,blow dry,botny wax', 'X-Large', 'Buff Wax', 50, 800, 'active'],
            [35, 'High Gloss', 'body wash,vacuum,tire black,blow dry,meguar;s wax', 'Small', 'Buff Wax', 50, 500, 'active'],
            [36, 'High Gloss', 'body wash,vacuum,tire black,blow dry,meguar;s wax', 'Medium', 'Buff Wax', 50, 580, 'active'],
            [37, 'High Gloss', 'body wash,vacuum,tire black,blow dry,meguar;s wax', 'Large', 'Buff Wax', 50, 720, 'active'],
            [38, 'High Gloss', 'body wash,vacuum,tire black,blow dry,meguar;s wax', 'X-Large', 'Buff Wax', 50, 900, 'active'],
            [39, 'Hard Shell', 'body wash,vacuum,tire black,blow dry,turtle wax, armor all', 'Small', 'Complete Package', 120, 660, 'active'],
            [40, 'Hard Shell', 'body wash,vacuum,tire black,blow dry,turtle wax, armor all', 'Medium', 'Complete Package', 120, 740, 'active'],
            [41, 'Hard Shell', 'body wash,vacuum,tire black,blow dry,turtle wax, armor all', 'Large', 'Complete Package', 120, 930, 'active'],
            [42, 'Hard Shell', 'body wash,vacuum,tire black,blow dry,turtle wax, armor all', 'X-Large', 'Complete Package', 120, 1100, 'active'],
            [43, 'Waterproof', 'body wash,vacuum,tire black,blow dry,botny wax, armor all', 'Small', 'Complete Package', 120, 700, 'active'],
            [44, 'Waterproof', 'body wash,vacuum,tire black,blow dry,botny wax, armor all', 'Medium', 'Complete Package', 120, 790, 'active'],
            [45, 'Waterproof', 'body wash,vacuum,tire black,blow dry,botny wax, armor all', 'Large', 'Complete Package', 120, 1070, 'active'],
            [46, 'Waterproof', 'body wash,vacuum,tire black,blow dry,botny wax, armor all', 'X-Large', 'Complete Package', 120, 1250, 'active'],
            [47, 'High Gloss', 'body wash,vacuum,tire black,blow dry,meguir\'s wax, armor all', 'Small', 'Complete Package', 120, 800, 'active'],
            [48, 'High Gloss', 'body wash,vacuum,tire black,blow dry,meguir\'s wax, armor all', 'Medium', 'Complete Package', 120, 890, 'active'],
            [49, 'High Gloss', 'body wash,vacuum,tire black,blow dry,meguir\'s wax, armor all', 'Large', 'Complete Package', 120, 1130, 'active'],
            [50, 'High Gloss', 'body wash,vacuum,tire black,blow dry,meguir\'s wax, armor all', 'X-Large', 'Complete Package', 120, 1350, 'active'],
        ]);

        foreach ($rows as $r) {
            [$id,$name,$desc,$size,$cat,$duration,$price,$status] = $r;
            if (! DB::table('services')->where('service_id', $id)->exists()) {
                DB::table('services')->insert([
                    'service_id' => $id,
                    'service_name' => $name,
                    'description' => $desc,
                    'size' => $size,
                    'category' => $cat,
                    'estimated_duration' => $duration,
                    'price' => $price,
                    'status' => $status,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }
}
