import matplotlib.pyplot as plt
import numpy as np

def apply_softcap_logarithmic(value, cap, scaling_multiplier):
    if value <= cap:
        return value
    scaling_factor = cap * scaling_multiplier

    return cap + scaling_factor * (np.log(value/cap)/np.log(2))

# Parameters
cap = 200
scaling_multiplier = 0
values = np.linspace(0, cap * 4, 100)  # Range of values for testing
effective_values = [apply_softcap_logarithmic(v, cap, scaling_multiplier) for v in values]

# Plot
plt.plot(values, effective_values, label=f'Softcap @ {cap}, Scaling Multiplier: {scaling_multiplier}')
plt.axvline(cap, color='r', linestyle='--', label='Cap Threshold')
plt.title('Logarithmic Softcap Effect')
plt.xlabel('Base Value')
plt.ylabel('Effective Value')
plt.legend()
plt.grid(True)
plt.show()

# 0 -> 0
# 50 -> 50
# 100 -> 100
# 200 -> 150
# 400 -> 200
# 800 -> 250 
# 1600 -> 300 