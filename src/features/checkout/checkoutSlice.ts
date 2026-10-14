import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface DemoReceipt {
    itemCount: number;
    subtotalCents: number;
}

const checkoutSlice = createSlice({
    name: 'checkout',
    initialState: { receipt: null as DemoReceipt | null },
    reducers: {
        orderSimulated(state, { payload }: PayloadAction<DemoReceipt>) {
            state.receipt = payload;
        },
    },
});

export const { orderSimulated } = checkoutSlice.actions;
export default checkoutSlice.reducer;
