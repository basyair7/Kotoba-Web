import { PageProps } from "$fresh/server.ts";

export default function Greet(props: PageProps) {
  return <div>こんにちは！ {props.params.name}</div>;
}
