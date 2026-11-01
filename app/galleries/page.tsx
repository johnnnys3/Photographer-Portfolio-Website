import { redirect } from 'next/navigation';

// Galleries became Work in the Darkroom redesign.
export default function Galleries() {
  redirect('/work');
}
