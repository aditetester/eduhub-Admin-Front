import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const userId = request.url.split('/').pop();
    const response = await fetch(`${process.env.API_URL}/purchases/user/${userId}`);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { purchaseId, status } = await request.json();
    const response = await fetch(`${process.env.API_URL}/purchases/${purchaseId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update status' },
      { status: 500 }
    );
  }
} 