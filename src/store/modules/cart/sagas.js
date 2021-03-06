import { call, select, put, all, takeLatest } from 'redux-saga/effects';
import api from '../../../services/api';
import { formatPrice } from '../../../util/format';
import { AddToCartSucces, UpdateAmountSuccess } from './actions'

import { toast } from 'react-toastify';


function* addToCart({ id }) {
  const productExists = yield select(
    state => state.cart.find(p => p.id ===id),  
  )

  const stock = yield call(api.get, `/stock/${id}`)

  const stockAmount = stock.data.amount;
  const currentAmount = productExists ? productExists.amount : 0;

  const amount = currentAmount + 1;

  if (amount > stockAmount) {
    toast.error('Quantidade fora do estoque');
    return;
  }


  if(productExists){
    yield put(UpdateAmountSuccess(id, amount));
  }

  else {
    const response = yield call(api.get, `/products/${id}`)

    const data = {
      ...response.data,
      amount: 1,
      priceFormatted: formatPrice(response.data.price),
    };

    yield put(AddToCartSucces(data))
  }
}

function* updateAmount({id, amount}) {
  if( amount <= 0) return;

  const stock = yield call(api.get, `/stock/${id}`);

  const stockAmount = stock.data.amount;

  if( amount > stockAmount) {
    toast.error('Quantidade fora do estoque');
    return;
  }

  yield put(UpdateAmountSuccess(id, amount))
}

export default all([
  takeLatest('@cart/ADD_REQUEST', addToCart),
  takeLatest('@cart/UPDATE_AMOUNT_REQUEST', updateAmount)
])