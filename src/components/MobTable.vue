<template>
    <DataTable :data="mobs" :columns="columns" :options="options" class="display">
        <thead>
            <tr>
                <th>VNUM</th>
                <th>level</th>
                <th>Desc</th>
            </tr>
        </thead>
    </DataTable>
</template>

<script setup>
import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net';
import 'datatables.net-select';
import 'datatables.net-responsive';
 
DataTable.use(DataTablesCore);
const columns = [{data: 'vnum', title: 'VNUM'},
                 {data: 'level', title: 'level'},
                 {data: 'shortDescription', title:'Desc'}]

const props = defineProps(['mobs'])

const options = {
    paging: false
}
</script>

<style scoped>

</style>