import { getFirstElement } from './GameElementsHelpers';

const BALL_LAUNCH_MAX_TIME = 200;

export function createTouchManager(Hammer, anime, ball, screen, actions, state) {
  const touchElement = getFirstElement('touch-layer');
  // Create a manager to manage the touch area
  const manager = new Hammer.Manager(touchElement);
  const pan = new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 });
  const swipe = new Hammer.Swipe();
  swipe.recognizeWith(pan);
  // ball pan events
  manager.add(pan);
  manager.on('pan', (event) => {
    if (event.center) {
      ball.moveBallPointer(event.center.x, event.center.y);
    }
    if (event.isFinal) {
      setTimeout(() => {
        if (ball.inMotion === false) {
          ball.resetBall();
        }
      }, BALL_LAUNCH_MAX_TIME);
    }
  });
  // ball swipe events
  manager.add(swipe);
  manager.on('swipe', (event) => {
    ball.inMotion = true;
    const screenElement = getFirstElement('screen');
    const screenRect = screenElement.getBoundingClientRect();
    const { angle, deltaY } = event;
    let maxVelocity = screen.height * 0.009;
    let velocity = Math.abs(event.velocity);
    if (velocity > maxVelocity) {
      velocity = maxVelocity;
    }
    // Determine the final position.
    const scalePercent = Math.log(velocity + 1) / Math.log(maxVelocity + 1);
    const movementY = deltaY;
    // Determine how far it needs to travel from the current position to the destination.
    const translateYValue = -0.75 * screen.height * scalePercent;
    const translateXValue = -1 * (angle + 90) * (translateYValue / 100);
    anime.remove('.ring-fill');
    anime({
      targets: ['.ball'],
      translateX: {
        duration: 300,
        value: translateXValue,
        easing: 'easeOutSine'
      },
      translateY: {
        value: `${movementY * 1.25}px`,
        duration: 300,
        easing: 'easeOutSine'
      },
      scale: {
        value: 1 - 0.5 * scalePercent,
        easing: 'easeInSine',
        duration: 300
      },
      complete: () => {
        if (movementY < 0) {
          actions.throwBall(movementY, translateXValue, scalePercent);
        } else {
          setTimeout(state.resetState, 400);
        }
      }
    });
    return manager;
  });
}
