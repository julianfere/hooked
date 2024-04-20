export class MissingHandler extends Error {
  constructor(handlerName: string) {
    super(
      `Missing handler for ${handlerName}, please provide a handler for this action.`
    );
    this.name = "MissingHandler";
  }
}
