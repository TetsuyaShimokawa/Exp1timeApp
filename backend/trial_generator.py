import random
import string

STAKES = [200, 500, 1000]          # yen — lab-appropriate
EXCHANGE_RATES = [1.0, 1.05, 1.1, 1.2, 1.5, 2.0]
DELAYS = {
    "1week":  "1週間後",
    "1month": "1ヶ月後",
    "3months": "3ヶ月後",
}

DIGIT_CHANGE_EVERY = 1  # new digit string every block (3 blocks total)


def make_digit_string() -> str:
    first = random.choice("123456789")
    rest = "".join(random.choices(string.digits, k=6))
    return first + rest


def generate_digit_strings(n_blocks: int) -> list[str]:
    strings = []
    current = ""
    for i in range(n_blocks):
        if i % DIGIT_CHANGE_EVERY == 0:
            current = make_digit_string()
        strings.append(current)
    return strings


def generate_ctb_trials(delay_condition: str) -> list[dict]:
    """3 stakes × 6 exchange rates = 18 trials, grouped into 3 blocks by stake."""
    stakes = STAKES.copy()
    random.shuffle(stakes)  # randomise block order

    trials = []
    counter = 1
    for block_idx, stake in enumerate(stakes):
        rates = EXCHANGE_RATES.copy()
        random.shuffle(rates)
        for rate in rates:
            trials.append({
                "trial_id": f"t{counter:03d}",
                "block": block_idx + 1,
                "stake": stake,
                "exchange_rate": rate,
                "delay": delay_condition,
                "delay_label": DELAYS[delay_condition],
            })
            counter += 1
    return trials
